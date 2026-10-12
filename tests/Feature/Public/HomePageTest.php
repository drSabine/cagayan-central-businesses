<?php

use App\Models\BusinessType;
use App\Models\Municipality;
use App\Models\Wish;
use Inertia\Testing\AssertableInertia as Assert;

test('the home page shows the towns, types, and years behind the data', function () {
    $towns = Municipality::factory()->count(3)->create();
    $connected = Municipality::factory()->connected()->create();
    $types = BusinessType::factory()->count(2)->create();
    Wish::factory()->count(5)->recycle($towns)->recycle($types)->create();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('overview.townCount', 4)
            ->where('overview.connectedTownCount', 1)
            ->where('overview.connectedTownCodes', [$connected->psgc_code])
            ->where('overview.businessTypeCount', 2)
            ->where('overview.wishCount', 5)
            ->where('overview.firstYear', config('cagayan.data.first_year'))
            ->where('overview.latestYear', config('cagayan.data.latest_year'))
            ->where('overview.yearCount', config('cagayan.data.latest_year') - config('cagayan.data.first_year') + 1)
            ->where('simulated', true));
});

test('the home page works before any town is loaded', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('overview.townCount', 0)
            ->where('overview.connectedTownCodes', []));
});
