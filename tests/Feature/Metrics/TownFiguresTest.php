<?php

use App\Data\TownProfile;
use App\Enums\TownMeasure;
use App\Models\Municipality;
use App\Models\TownFact;
use App\Queries\TownAtlasQuery;

/**
 * @param  list<array{TownMeasure, int, int}>  $facts
 */
function townWith(string $name, array $facts): Municipality
{
    $town = Municipality::factory()->create(['name' => $name]);

    foreach ($facts as [$measure, $year, $value]) {
        TownFact::factory()->for($town)->measure($measure, $year, $value)->create();
    }

    return $town;
}

it('uses the newest year of each figure', function () {
    townWith('Alpha', [
        [TownMeasure::Population, 2020, 1000],
        [TownMeasure::Population, 2024, 1100],
        [TownMeasure::Revenue, 2024, 5000],
    ]);

    $alpha = app(TownAtlasQuery::class)->get()->towns[0];

    expect($alpha->population?->value)->toBe('1100.00')
        ->and($alpha->population?->year)->toBe(2024)
        ->and($alpha->revenue?->value)->toBe('5000.00');
});

it('reports a missing figure as null, never zero', function () {
    townWith('Alpha', []);

    $alpha = app(TownAtlasQuery::class)->get()->towns[0];

    expect($alpha->population)->toBeNull()
        ->and($alpha->expenditure)->toBeNull()
        ->and($alpha->shade)->toBeNull();
});

it('shades towns by population, fewest people first (M18)', function () {
    $shades = config('cagayan.towns.shades');

    foreach (range(1, $shades) as $index) {
        townWith("Town {$index}", [[TownMeasure::Population, 2024, $index * 10]]);
    }

    $atlas = app(TownAtlasQuery::class)->get();

    // One town per shade, so the smallest town gets shade 1 and the largest the top shade.
    expect(collect($atlas->towns)->map(fn (TownProfile $town) => $town->shade)->all())
        ->toBe(range(1, $shades));
});

it('shows a province total only when every town has the figure', function () {
    townWith('Alpha', [[TownMeasure::Population, 2024, 100], [TownMeasure::Revenue, 2024, 5000]]);
    townWith('Beta', [[TownMeasure::Population, 2024, 200]]);

    $province = app(TownAtlasQuery::class)->get()->province;

    expect($province->population?->value)->toBe('300.00')
        ->and($province->revenue)->toBeNull();
});
