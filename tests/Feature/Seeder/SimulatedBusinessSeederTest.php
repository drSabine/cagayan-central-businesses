<?php

use Database\Seeders\BarangaySeeder;
use Database\Seeders\BusinessTypeSeeder;
use Database\Seeders\MunicipalitySeeder;
use Database\Seeders\SimulatedBusinessSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->seed([MunicipalitySeeder::class, BarangaySeeder::class, BusinessTypeSeeder::class]);
    $this->artisan('barangays:import')->assertSuccessful();
    $this->seed(SimulatedBusinessSeeder::class);
    $this->artisan('metrics:refresh')->assertSuccessful();
    $this->latest = (int) config('cagayan.data.latest_year');
});

it('keeps every year consistent with the one before it (status rules)', function () {
    $years = DB::table('business_years')->groupBy('year')->orderBy('year')->selectRaw("year,
        count(*) filter (where status in ('new', 'renewed')) as active,
        count(*) filter (where status = 'new') as new, count(*) filter (where status = 'renewed') as renewed,
        count(*) filter (where status = 'not_renewed') as not_renewed, count(*) filter (where status = 'closed') as closed")
        ->get()->keyBy('year');

    foreach ($years as $year => $row) {
        $previous = $years->get($year - 1);
        if ($previous === null) {
            continue;
        }
        expect($row->active)->toBe($previous->active + $row->new - $row->not_renewed - $row->closed)
            ->and($row->renewed + $row->not_renewed + $row->closed)->toBe($previous->active);
    }
});

it('has no rows after a business stops renewing', function () {
    expect(DB::table('business_years as later')
        ->join('business_years as ended', fn ($join) => $join->on('ended.business_id', '=', 'later.business_id')->whereColumn('later.year', '>', 'ended.year'))
        ->whereIn('ended.status', ['not_renewed', 'closed'])->count())->toBe(0);
});

it('includes a barangay below the small-group threshold (seeder requirement 5)', function () {
    $min = config('cagayan.privacy.small_group_min');

    expect(DB::table('stats_area_year')->where('year', $this->latest)->groupBy('barangay_id')
        ->havingRaw('sum(active_count) between 1 and ?', [$min - 1])->selectRaw('barangay_id')->count())->toBeGreaterThan(0);
});

it('includes a barangay where one business dominates its sales (seeder requirement 6)', function () {
    $min = config('cagayan.privacy.small_group_min');
    $share = config('cagayan.privacy.dominance_max_share');

    expect(DB::table('stats_area_year')->where('year', $this->latest)->groupBy('barangay_id')
        ->havingRaw('sum(active_count) >= ? and max(declared_sales_max_single) > ? * sum(declared_sales_total)', [$min, $share])
        ->selectRaw('barangay_id')->count())->toBeGreaterThan(0);
});

it('puts more businesses in populous barangays and every point inside its barangay (requirements 4 and 9)', function () {
    $counts = DB::table('barangays as g')->leftJoin('businesses as b', 'b.barangay_id', '=', 'g.id')
        ->groupBy('g.id', 'g.population')->orderBy('g.population')->selectRaw('count(b.id) as businesses')->pluck('businesses');

    expect($counts->take(10)->avg())->toBeLessThan($counts->take(-10)->avg())
        ->and(DB::table('businesses as b')->join('barangays as g', 'g.id', '=', 'b.barangay_id')
            ->whereRaw('not ST_Contains(g.boundary, b.location)')->count())->toBe(0);
});
