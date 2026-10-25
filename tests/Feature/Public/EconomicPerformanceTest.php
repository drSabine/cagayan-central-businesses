<?php

use App\Enums\TownMeasure;
use App\Models\Municipality;
use App\Models\TownFact;
use App\Models\Wish;
use App\Queries\EconomicPerformanceQuery;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Filesystem\Filesystem;
use Inertia\Testing\AssertableInertia as Assert;

test('the public overview includes both datasets and preserves exact cents', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000', 'name' => 'Tuguegarao City']);
    Municipality::factory()->count(28)->sequence(fn (Sequence $sequence) => [
        'psgc_code' => sprintf('02015%02d000', $sequence->index + 1),
    ])->create();
    config(['cagayan.simulated' => false]);

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->component('public/economic-performance')
        ->where('simulated', true)
        ->has('performance.towns', 29)
        ->missing('performance.filters.financeView')
        ->where('performance.filters.wishView', 'cloud')
        ->missing('performance.filters.topic')
        ->missing('performance.filters.view')
        ->has('performance.datasets', 1)
        ->where('performance.datasets.0201529000.wishes.townCode', '0201529000')
        ->where('performance.datasets.0201529000.wishes.townName', 'Tuguegarao City')
        ->where('performance.datasets.0201529000.finances.source.mode', 'simulated')
        ->where('performance.datasets.0201529000.finances.rows.0.year', 2021)
        ->where('performance.datasets.0201529000.finances.rows.0.observations.government_revenue.value', '2400000000.25')
        ->where('performance.datasets.0201529000.finances.rows.0.observations.government_revenue.percentageChange', null)
        ->where('performance.datasets.0201529000.finances.rows.1.observations.government_revenue.change', '240000000.00')
        ->where('performance.datasets.0201529000.finances.rows.1.observations.government_revenue.percentageChange', 10)
        ->where('performance.datasets.0201529000.finances.rows.2.observations.government_expenses.change', '-115500000.00')
        ->where('performance.datasets.0201529000.finances.rows.2.observations.government_expenses.percentageChange', -5)
        ->has('performance.datasets.0201529000.wishes.items', 26));
});

test('other towns remain unavailable even if they have verified facts and live wishes', function () {
    $town = Municipality::factory()->create(['psgc_code' => '0201501000']);
    TownFact::factory()->verified()->for($town)->measure(TownMeasure::Revenue, 2024, '987654321.12')->create();
    Wish::factory()->for($town)->create(['specific_business' => 'PRIVATE COMPANY SENTINEL', 'reason' => 'PRIVATE REASON SENTINEL']);

    $response = $this->get(route('public.economic-performance', ['town' => $town->psgc_code]));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('performance.datasets', []))
        ->assertDontSee('PRIVATE COMPANY SENTINEL')->assertDontSee('PRIVATE REASON SENTINEL')->assertDontSee('987654321.12');
});

test('finance and wish selections survive together without resetting each other', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);

    $this->get(route('public.economic-performance', ['period' => 'recent', 'kind' => 'specific', 'financeView' => 'table', 'wishView' => 'bars']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.filters.period', 'recent')
            ->missing('performance.filters.financeView')
            ->where('performance.filters.wishView', 'bars')
            ->missing('performance.filters.kind')
            ->has('performance.datasets.0201529000.finances.rows', 5)
            ->where('performance.periods.recent', 2023)
            ->where('performance.datasets.0201529000.wishes.asOf', '2026-10-25')
            ->where('performance.datasets.0201529000.wishes.items.6.label', 'Northbank Coffee'));
});

test('the selected period survives a direct link and retired filters are ignored', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);

    $this->get(route('public.economic-performance', ['period' => 'recent', 'financeView' => 'table', 'kind' => 'specific']))
        ->assertInertia(fn (Assert $page) => $page
            ->missing('performance.filters.financeView')
            ->missing('performance.filters.kind')
            ->has('performance.datasets.0201529000.finances.rows', 5)
            ->where('performance.periods.recent', 2023)
            ->where('performance.datasets.0201529000.finances.rows.0.year', 2021)
            ->where('performance.datasets.0201529000.finances.rows.2.observations.government_revenue.comparisonYear', 2022));
});

test('all wish presentations receive the same curated aggregates and no raw submissions', function (string $view) {
    $town = Municipality::factory()->create(['psgc_code' => '0201529000']);
    Wish::factory()->for($town)->create(['specific_business' => 'PRIVATE COMPANY SENTINEL', 'reason' => 'PRIVATE REASON SENTINEL']);

    $this->get(route('public.economic-performance', ['wishView' => $view]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.filters.wishView', $view)
            ->missing('performance.filters.financeView')
            ->has('performance.datasets.0201529000.finances.rows', 5)
            ->has('performance.datasets.0201529000.wishes.items', 26)
            ->where('performance.datasets.0201529000.wishes.items.0', ['id' => 'types:pharmacy', 'label' => 'Pharmacy', 'count' => 84])
            ->where('performance.datasets.0201529000.wishes.items.10.label', 'Dental Clinic')
            ->where('performance.datasets.0201529000.wishes.items.11.label', 'Veterinary Clinic')
            ->missing('performance.datasets.0201529000.wishes.reason')
            ->missing('performance.datasets.0201529000.wishes.submitter_hash'))
        ->assertDontSee('PRIVATE COMPANY SENTINEL')->assertDontSee('PRIVATE REASON SENTINEL');
})->with(['cloud', 'bars']);

test('invalid filters fail validation before producing a dataset', function (array $filters, string $field) {
    $this->getJson(route('public.economic-performance', $filters))->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'unknown town' => [['town' => '0201599999'], 'town'],
    'unknown period' => [['period' => 'future'], 'period'],
    'removed table view' => [['wishView' => 'table'], 'wishView'],
    'invalid wishes view' => [['wishView' => 'chart'], 'wishView'],
    'array input' => [['wishView' => ['cloud']], 'wishView'],
]);

test('missing hidden and non-comparable years never expose a fabricated annual change', function (Closure $alter, ?string $expectedChange) {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    $demo = require base_path('data/economic-performance/demo.php');
    $demo = $alter($demo);
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files));

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->where('performance.datasets.0201529000.finances.rows.2.observations.government_revenue.percentageChange', null)
        ->where('performance.datasets.0201529000.finances.rows.2.observations.government_revenue.change', $expectedChange));
})->with([
    'missing prior year' => [function (array $demo): array {
        unset($demo['finances']['rows'][1]);

        return $demo;
    }, null],
    'non-comparable current year' => [function (array $demo): array {
        $demo['finances']['rows'][2]['observations']['government_revenue']['comparable'] = false;

        return $demo;
    }, null],
    'hidden current year' => [function (array $demo): array {
        $demo['finances']['rows'][2]['observations']['government_revenue']['state'] = 'hidden';

        return $demo;
    }, null],
    'zero previous year' => [function (array $demo): array {
        $demo['finances']['rows'][1]['observations']['government_revenue']['value'] = '0.00';
        $demo['finances']['rows'][2]['observations']['government_revenue']['change'] = '2904000000.25';

        return $demo;
    }, '2904000000.25'],
]);

test('empty wish aggregates remain empty and do not become zero-filled businesses', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    $demo = require base_path('data/economic-performance/demo.php');
    $demo['wishes']['types'] = [];
    $demo['wishes']['specific'] = [];
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files));

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->where('performance.datasets.0201529000.wishes.items', [])
        ->where('performance.datasets.0201529000.wishes.cloudLimit', config('cagayan.performance.cloud_limit')));
});

test('the data contract accepts another financial metric and preserves a missing calendar year', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    $demo = require base_path('data/economic-performance/demo.php');
    $demo['finances']['metrics'][0]['id'] = 'liabilities';
    $demo['finances']['metrics'][0]['label'] = 'Government Liabilities';
    foreach ($demo['finances']['rows'] as &$row) {
        $row['observations']['liabilities'] = $row['observations']['government_revenue'];
        unset($row['observations']['government_revenue']);
    }
    unset($row, $demo['finances']['rows'][2]);
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files));

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->where('performance.datasets.0201529000.finances.metrics.0.id', 'liabilities')
        ->where('performance.datasets.0201529000.finances.rows.2.year', 2023)
        ->where('performance.datasets.0201529000.finances.rows.2.observations.liabilities.state', 'unavailable')
        ->where('performance.datasets.0201529000.finances.rows.2.observations.liabilities.value', null)
        ->where('performance.datasets.0201529000.finances.rows.3.observations.liabilities.change', null));
});

test('an unavailable initial town still receives the public catalog for local town and mode switching', function () {
    $other = Municipality::factory()->create(['psgc_code' => '0201501000']);
    Municipality::factory()->create(['psgc_code' => '0201529000']);

    $this->get(route('public.economic-performance', ['town' => $other->psgc_code, 'period' => 'recent', 'kind' => 'specific']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.filters.town', $other->psgc_code)
            ->missing('performance.datasets.0201501000')
            ->has('performance.datasets', 1)
            ->has('performance.datasets.0201529000.finances.rows', 5)
            ->has('performance.datasets.0201529000.wishes.items', 26)
            ->where('performance.periods.recent', 2023));
});

test('combined wishes preserve distinct identities and exact counts across equal labels and ties', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    $demo = require base_path('data/economic-performance/demo.php');
    $demo['wishes']['types'] = [['id' => 'same', 'label' => 'A Very Long Business Phrase That Must Remain Complete', 'count' => 7]];
    $demo['wishes']['specific'] = [['id' => 'same', 'label' => 'A Very Long Business Phrase That Must Remain Complete', 'count' => 7]];
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files));

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->has('performance.datasets.0201529000.wishes.items', 2)
        ->where('performance.datasets.0201529000.wishes.items.0.id', 'specific:same')
        ->where('performance.datasets.0201529000.wishes.items.1.id', 'types:same')
        ->where('performance.datasets.0201529000.wishes.items.0.label', 'A Very Long Business Phrase That Must Remain Complete')
        ->where('performance.datasets.0201529000.wishes.items.0.count', 7)
        ->where('performance.datasets.0201529000.wishes.items.1.count', 7)
        ->missing('performance.filters.kind')
        ->missing('performance.filters.financeView'));
});

test('large combined wish lists retain every complete label beyond the cloud limit', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    $demo = require base_path('data/economic-performance/demo.php');
    $demo['wishes']['types'] = array_map(fn (int $index) => [
        'id' => 'label-'.$index,
        'label' => 'Complete Community Business Phrase With Many Words '.$index,
        'count' => 121 - $index,
    ], range(1, 120));
    $demo['wishes']['specific'] = [];
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files));

    $this->get(route('public.economic-performance', ['wishView' => 'bars']))->assertInertia(fn (Assert $page) => $page
        ->has('performance.datasets.0201529000.wishes.items', 120)
        ->where('performance.datasets.0201529000.wishes.items.0.count', 120)
        ->where('performance.datasets.0201529000.wishes.items.119.label', 'Complete Community Business Phrase With Many Words 120')
        ->where('performance.datasets.0201529000.wishes.items.119.count', 1));
});
