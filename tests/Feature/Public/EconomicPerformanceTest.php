<?php

use App\Enums\FinanceFigureStatus;
use App\Models\FinanceDocument;
use App\Models\FinanceFigure;
use App\Models\FinanceLine;
use App\Models\Municipality;
use App\Models\Wish;
use App\Queries\AnalyticsCatalogQuery;
use App\Queries\EconomicPerformanceQuery;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Filesystem\Filesystem;
use Inertia\Testing\AssertableInertia as Assert;

function economyWithWishes(Closure $alter): void
{
    $demo = $alter(require base_path('data/economic-performance/demo.php'));
    $files = Mockery::mock(Filesystem::class);
    $files->shouldReceive('getRequire')->once()->andReturn($demo);
    app()->instance(EconomicPerformanceQuery::class, new EconomicPerformanceQuery($files, app(AnalyticsCatalogQuery::class)));
}

test('the public catalog lists every town with the sum of reporting towns first', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000', 'name' => 'Tuguegarao City']);
    Municipality::factory()->count(28)->sequence(fn (Sequence $sequence) => [
        'psgc_code' => sprintf('02015%02d000', $sequence->index + 1),
    ])->create();
    config(['cagayan.simulated' => false]);

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->component('public/economic-performance')
        ->where('simulated', true)
        ->has('performance.catalog.towns', 30)
        ->where('performance.catalog.towns.0', ['value' => AnalyticsCatalogQuery::ALL_TOWNS, 'label' => 'Sum of Reporting Towns'])
        ->where('performance.catalog.periods', ['all' => 2019, 'recent' => 2023])
        ->where('performance.filters.measure', 'totals')
        ->where('performance.filters.wishView', 'cloud')
        ->where('performance.wishes.0201529000.townName', 'Tuguegarao City')
        ->has('performance.wishes.0201529000.items', 26));
});

test('only signed-off figures reach the public series, with exact cents', function () {
    $town = Municipality::factory()->create(['psgc_code' => '0201501000']);
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    FinanceFigure::factory()->verified()->for($town)->line('performance.revenue', 2024, '196960688.39')->create();
    FinanceFigure::factory()->for($town)->line('performance.revenue', 2025, '987654321.12')->create();
    $this->artisan('metrics:refresh')->assertSuccessful();

    $this->get(route('public.economic-performance', ['town' => '0201501000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.finances.0201501000.totals.rows.5.year', 2024)
            ->where('performance.catalog.finances.0201501000.totals.rows.5.observations', fn ($points) => $points['performance.revenue']['value'] === '196960688.39')
            ->where('performance.catalog.finances.0201501000.totals.rows.6.observations', fn ($points) => $points['performance.revenue']['state'] === 'unavailable')
            ->where('performance.catalog.finances.0201501000.totals.source.mode', 'verified')
            ->where('performance.catalog.finances.0201500000.totals.rows.5.observations', fn ($points) => $points['performance.revenue']['coverage'] === ['reporting' => 1, 'total' => 2, 'matched' => 0])
            ->missing('performance.catalog.finances.0201529000'))
        ->assertDontSee('987654321.12');
});

test('a missing year says why it is missing and never shows a value', function () {
    $town = Municipality::factory()->create(['psgc_code' => '0201501000']);
    FinanceFigure::factory()->verified()->for($town)->line('performance.revenue', 2024, '100.00')->create();
    FinanceFigure::factory()->for($town)->line('performance.revenue', 2022, '987654321.12')->create();
    FinanceFigure::factory()->verified()->for($town)->line('performance.expenses', 2021, '50.00')->create();
    FinanceDocument::factory()->notPublished()->for($town)->create(['fiscal_year' => 2025]);
    FinanceLine::factory()->create(['code' => 'revenue.tax', 'group' => 'revenue_sources', 'source' => 'fs_workbook']);
    $this->artisan('metrics:refresh')->assertSuccessful();

    $reason = fn (int $row, string $line, string $expected) => fn ($points) => $points[$line]['reason'] === $expected && $points[$line]['value'] === null;
    $this->get(route('public.economic-performance', ['town' => '0201501000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.finances.0201501000.totals.rows.6.observations', $reason(6, 'performance.revenue', 'not_published'))
            ->where('performance.catalog.finances.0201501000.totals.rows.3.observations', $reason(3, 'performance.revenue', 'pending_review'))
            ->where('performance.catalog.finances.0201501000.totals.rows.2.observations', $reason(2, 'performance.revenue', 'not_reported'))
            ->where('performance.catalog.finances.0201501000.totals.rows.4.observations', $reason(4, 'performance.revenue', 'not_collected'))
            ->where('performance.catalog.finances.0201501000.revenue_sources.rows.5.observations', $reason(5, 'revenue.tax', 'not_collected')))
        ->assertDontSee('987654321.12');
});

test('a figure that replaced a different earlier one says which report restated it', function () {
    $town = Municipality::factory()->create(['psgc_code' => '0201501000']);
    FinanceFigure::factory()->for($town)->line('performance.revenue', 2023, '390.00')->create(['status' => FinanceFigureStatus::Superseded, 'reviewed_on' => '2026-10-27']);
    $report = FinanceDocument::factory()->for($town)->create(['fiscal_year' => 2024]);
    FinanceFigure::factory()->verified()->for($town)->line('performance.revenue', 2023, '400.00')->create(['finance_document_id' => $report->id]);
    FinanceFigure::factory()->verified()->for($town)->line('performance.revenue', 2024, '500.00')->create();
    $this->artisan('metrics:refresh')->assertSuccessful();

    $this->get(route('public.economic-performance', ['town' => '0201501000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.finances.0201501000.totals.rows.4.observations', fn ($points) => $points['performance.revenue']['restatedIn'] === 2024 && $points['performance.revenue']['value'] === '400.00')
            ->where('performance.catalog.finances.0201501000.totals.rows.5.observations', fn ($points) => $points['performance.revenue']['restatedIn'] === null));
});

test('selections survive a direct link and retired filters are ignored', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);

    $this->get(route('public.economic-performance', ['period' => 'recent', 'measure' => 'revenue_sources', 'dimension' => 'tag', 'financeView' => 'table', 'kind' => 'specific', 'wishView' => 'bars']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.filters', [
                'town' => '0201529000', 'period' => 'recent', 'measure' => 'revenue_sources',
                'dimension' => 'tag', 'group' => null, 'wishView' => 'bars',
            ]));
});

test('wish presentations receive the same curated aggregates and no raw submissions', function (string $view) {
    $town = Municipality::factory()->create(['psgc_code' => '0201529000']);
    Wish::factory()->for($town)->create(['specific_business' => 'PRIVATE COMPANY SENTINEL', 'reason' => 'PRIVATE REASON SENTINEL']);

    $this->get(route('public.economic-performance', ['wishView' => $view]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.filters.wishView', $view)
            ->has('performance.wishes.0201529000.items', 26)
            ->where('performance.wishes.0201529000.items.0', ['id' => 'types:pharmacy', 'label' => 'Pharmacy', 'count' => 84])
            ->where('performance.wishes.0201529000.items.10.label', 'Dental Clinic')
            ->where('performance.wishes.0201529000.items.11.label', 'Veterinary Clinic')
            ->missing('performance.wishes.0201529000.reason'))
        ->assertDontSee('PRIVATE COMPANY SENTINEL')->assertDontSee('PRIVATE REASON SENTINEL');
})->with(['cloud', 'bars']);

test('invalid filters fail validation before producing a catalog', function (array $filters, string $field) {
    $this->getJson(route('public.economic-performance', $filters))->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'unknown town' => [['town' => '0201599999'], 'town'],
    'unknown period' => [['period' => 'future'], 'period'],
    'unknown measure' => [['measure' => 'assets'], 'measure'],
    'unknown dimension' => [['dimension' => 'barangay'], 'dimension'],
    'malformed group' => [['group' => 'industry:<b>'], 'group'],
    'removed table view' => [['wishView' => 'table'], 'wishView'],
    'array input' => [['wishView' => ['cloud']], 'wishView'],
]);

test('empty wish aggregates remain empty and do not become zero-filled businesses', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    economyWithWishes(function (array $demo): array {
        $demo['wishes']['types'] = [];
        $demo['wishes']['specific'] = [];

        return $demo;
    });

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->where('performance.wishes.0201529000.items', [])
        ->where('performance.wishes.0201529000.cloudLimit', config('cagayan.performance.cloud_limit')));
});

test('combined wishes preserve distinct identities and exact counts across equal labels and ties', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    economyWithWishes(function (array $demo): array {
        $demo['wishes']['types'] = [['id' => 'same', 'label' => 'A Very Long Business Phrase That Must Remain Complete', 'count' => 7]];
        $demo['wishes']['specific'] = [['id' => 'same', 'label' => 'A Very Long Business Phrase That Must Remain Complete', 'count' => 7]];

        return $demo;
    });

    $this->get(route('public.economic-performance'))->assertInertia(fn (Assert $page) => $page
        ->has('performance.wishes.0201529000.items', 2)
        ->where('performance.wishes.0201529000.items.0.id', 'specific:same')
        ->where('performance.wishes.0201529000.items.1.id', 'types:same')
        ->where('performance.wishes.0201529000.items.0.count', 7)
        ->where('performance.wishes.0201529000.items.1.count', 7));
});

test('large combined wish lists retain every complete label beyond the cloud limit', function () {
    Municipality::factory()->create(['psgc_code' => '0201529000']);
    economyWithWishes(function (array $demo): array {
        $demo['wishes']['types'] = array_map(fn (int $index) => [
            'id' => 'label-'.$index,
            'label' => 'Complete Community Business Phrase With Many Words '.$index,
            'count' => 121 - $index,
        ], range(1, 120));
        $demo['wishes']['specific'] = [];

        return $demo;
    });

    $this->get(route('public.economic-performance', ['wishView' => 'bars']))->assertInertia(fn (Assert $page) => $page
        ->has('performance.wishes.0201529000.items', 120)
        ->where('performance.wishes.0201529000.items.0.count', 120)
        ->where('performance.wishes.0201529000.items.119.count', 1));
});
