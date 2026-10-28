<?php

use App\Enums\BusinessStatus;
use App\Enums\UserRole;
use App\Models\Barangay;
use App\Models\Business;
use App\Models\BusinessType;
use App\Models\BusinessYear;
use App\Models\FocusTag;
use App\Models\Municipality;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

// A distinctive declared sales value that must never reach any response (P1, P7).
const SALES_SENTINEL = '7654321.98';

beforeEach(function () {
    $town = Municipality::factory()->create(['psgc_code' => '0201529000', 'name' => 'Tuguegarao City']);
    $barangay = Barangay::factory()->for($town)->create();
    $retail = BusinessType::factory()->create(['psic_section' => 'G', 'psic_section_name' => 'Wholesale and retail trade']);
    $farm = BusinessType::factory()->create(['psic_section' => 'A', 'psic_section_name' => 'Agriculture, forestry and fishing']);
    $salon = BusinessType::factory()->create(['psic_section' => 'S', 'psic_section_name' => 'Other service activities']);
    FocusTag::factory()->create(['code' => 'agriculture', 'name' => 'Agriculture'])->businessTypes()->attach($farm);

    $min = config('cagayan.privacy.small_group_min');
    // Retail: enough businesses, so its total is shown. Services: shown on its own but smaller. Farms: one below the threshold.
    foreach (range(1, $min + 1) as $index) {
        $business = Business::factory()->inBarangay($barangay)->ofType($retail)->create();
        BusinessYear::factory()->for($business)->status(BusinessStatus::Renewed, 2024)->sales($index === 1 ? SALES_SENTINEL : '5000000.00')->create();
    }
    foreach (range(1, $min + 1) as $index) {
        $business = Business::factory()->inBarangay($barangay)->ofType($salon)->create();
        BusinessYear::factory()->for($business)->status(BusinessStatus::Renewed, 2024)->sales('1000000.00')->create();
    }
    foreach (range(1, $min - 1) as $index) {
        $business = Business::factory()->inBarangay($barangay)->ofType($farm)->create();
        BusinessYear::factory()->for($business)->status(BusinessStatus::Renewed, 2024)->sales('3000000.00')->create();
    }
    $this->artisan('metrics:refresh')->assertSuccessful();
});

it('gives the public bands only, never a sales number', function () {
    $this->get(route('public.economic-performance', ['town' => '0201529000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.value', null)
            ->where('performance.catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.band', '₱10 million to ₱50 million')
            ->where('performance.catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.change', null))
        ->assertDontSee(SALES_SENTINEL)
        ->assertDontSee('32654321.98');
});

it('hides a small group with its reason and no band, for the public and the Capitol (P2)', function () {
    $hidden = fn (Assert $page, string $prefix) => $page
        ->where("{$prefix}.businesses.datasets.industry:A.sales.rows.0.observations.sales.state", 'hidden')
        ->where("{$prefix}.businesses.datasets.industry:A.sales.rows.0.observations.sales.reason", 'small_group')
        ->where("{$prefix}.businesses.datasets.industry:A.sales.rows.0.observations.sales.band", null)
        ->where("{$prefix}.businesses.datasets.industry:A.sales.rows.0.observations.sales.value", null);

    $this->get(route('public.economic-performance', ['town' => '0201529000']))
        ->assertInertia(fn (Assert $page) => $hidden($page, 'performance.catalog'));
    $this->actingAs(User::factory()->create(['role' => UserRole::Staff]))->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $hidden($page->component('capitol/analytics'), 'catalog'));
});

it('hides the smallest other cell when exactly one cell is hidden (P4)', function () {
    // Industry A is hidden by the small-group rule, so the smaller of G and S (services) is hidden too; G stays shown.
    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.industry:S.sales.rows.0.observations.sales.reason', 'complementary')
            ->where('catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.state', 'shown')
            ->where('catalog.businesses.datasets.industry:G.counts.rows.0.observations.active.value', (string) (config('cagayan.privacy.small_group_min') + 1))
            ->where('catalog.businesses.groups.tag.0.label', 'Agriculture'))
        ->assertDontSee(SALES_SENTINEL);
});

it('keeps community wishes out of the Capitol analytics response', function () {
    $this->actingAs(User::factory()->create(['role' => UserRole::Staff]))->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page->missing('wishes')->missing('catalog.wishes'));
});

it('gives the town share of businesses to everyone and the sales share only to the Capitol (M30, P6, P7)', function () {
    $this->get(route('public.economic-performance', ['town' => '0201529000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.businesses.datasets.industry:G.share.rows.0.observations', fn ($points) => isset($points['count_share']) && ! isset($points['sales_share']))
            ->where('performance.catalog.businesses.datasets.industry:G.share.metrics', fn ($metrics) => count($metrics) === 1));

    // Retail holds min + 1 of the town's 3 min + 1 active businesses; the farm industry's hidden sales hide its sales share.
    $min = config('cagayan.privacy.small_group_min');
    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.industry:G.share.rows.0.observations.count_share.value', number_format(($min + 1) * 100 / (3 * $min + 1), 1))
            ->where('catalog.businesses.datasets.industry:G.share.rows.0.observations.sales_share.state', 'shown')
            ->where('catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.percentageChange', null)
            ->where('catalog.businesses.datasets.industry:A.share.rows.0.observations.sales_share.state', 'hidden')
            ->where('catalog.businesses.datasets.industry:A.share.rows.0.observations.sales_share.value', null));
});

it('gives the Capitol the sales change with its percent and the public neither (M31, P7)', function () {
    $retail = BusinessType::query()->where('psic_section', 'G')->sole();
    Business::query()->where('business_type_id', $retail->id)->each(fn (Business $business) => BusinessYear::factory()->for($business)->status(BusinessStatus::New, 2023)->sales('5000000.00')->create());
    $this->artisan('metrics:refresh')->assertSuccessful();

    $min = config('cagayan.privacy.small_group_min');
    $before = ($min + 1) * 5000000;
    $after = (float) SALES_SENTINEL + $min * 5000000;
    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.industry:G.sales.rows.1.observations.sales.percentageChange', round(($after - $before) * 100 / $before, 1)));
    $this->get(route('public.economic-performance', ['town' => '0201529000']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('performance.catalog.businesses.datasets.industry:G.sales.rows.1.observations.sales.percentageChange', null));
});

it('hides a Focus Tag below the threshold, as it shrinks the group (P5)', function () {
    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.tag:agriculture.sales.rows.0.observations.sales.reason', 'small_group')
            ->where('catalog.businesses.datasets.tag:agriculture.sales.rows.0.observations.sales.value', null));
});

it('withholds the change from a hidden year and the share of a complementary cell (P6)', function () {
    // In 2024 services are hidden as complementary; in 2025 they stand alone and are shown.
    $salon = BusinessType::query()->where('psic_section', 'S')->sole();
    Business::query()->where('business_type_id', $salon->id)->each(fn (Business $business) => BusinessYear::factory()->for($business)->status(BusinessStatus::Renewed, 2025)->sales('1200000.00')->create());
    $this->artisan('metrics:refresh')->assertSuccessful();

    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('simulated', true)
            ->where('catalog.businesses.datasets.industry:S.sales.rows.1.year', 2025)
            ->where('catalog.businesses.datasets.industry:S.sales.rows.1.observations.sales.state', 'shown')
            ->where('catalog.businesses.datasets.industry:S.sales.rows.1.observations.sales.change', null)
            ->where('catalog.businesses.datasets.industry:S.sales.rows.1.observations.sales.percentageChange', null)
            ->where('catalog.businesses.datasets.industry:S.share.rows.0.observations.sales_share.state', 'hidden')
            ->where('catalog.businesses.datasets.industry:S.share.rows.0.observations.sales_share.reason', 'complementary'));
});

it('gives the Capitol Focus Tag sales as bands, so a tag cannot be subtracted from an industry', function () {
    $tag = FocusTag::factory()->create(['code' => 'retail', 'name' => 'Retail']);
    $tag->businessTypes()->attach(BusinessType::query()->where('psic_section', 'G')->sole());
    // A second shown tag, so P4 within the tags hides the smaller one rather than retail.
    FocusTag::factory()->create(['code' => 'services', 'name' => 'Services'])->businessTypes()->attach(BusinessType::query()->where('psic_section', 'S')->sole());
    $this->artisan('metrics:refresh')->assertSuccessful();

    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.state', 'shown')
            ->whereNot('catalog.businesses.datasets.industry:G.sales.rows.0.observations.sales.value', null)
            ->where('catalog.businesses.datasets.tag:retail.sales.rows.0.observations.sales.value', null)
            ->where('catalog.businesses.datasets.tag:retail.sales.rows.0.observations.sales.band', '₱10 million to ₱50 million')
            ->where('catalog.businesses.datasets.tag:retail.share.metrics', fn ($metrics) => count($metrics) === 1));
});

it('shows a year with no records as not available, never zero and never bridged', function () {
    // Retail trades in 2023 and 2025 but not 2024; the beforeEach groups supply 2024 for the town.
    $retail = BusinessType::query()->where('psic_section', 'G')->sole();
    BusinessYear::query()->whereIn('business_id', Business::query()->where('business_type_id', $retail->id)->select('id'))->delete();
    Business::query()->where('business_type_id', $retail->id)->each(function (Business $business) {
        BusinessYear::factory()->for($business)->status(BusinessStatus::New, 2023)->sales('5000000.00')->create();
        BusinessYear::factory()->for($business)->status(BusinessStatus::Renewed, 2025)->sales('5000000.00')->create();
    });
    $this->artisan('metrics:refresh')->assertSuccessful();

    $this->actingAs(User::factory()->create())->get(route('capitol.analytics'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('catalog.businesses.datasets.industry:G.counts.rows.1.year', 2024)
            ->where('catalog.businesses.datasets.industry:G.counts.rows.1.observations.active.state', 'unavailable')
            ->where('catalog.businesses.datasets.industry:G.counts.rows.1.observations.active.value', null)
            ->where('catalog.businesses.datasets.industry:G.counts.rows.2.observations.active.change', null));
});
