<?php

use Inertia\Testing\AssertableInertia as Assert;

// P13. The shared layouts show the label from this one prop, driven by config.

test('every page is told the data is simulated', function () {
    config(['cagayan.simulated' => true]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('simulated', true));
});

test('the label turns off with the config value', function () {
    config(['cagayan.simulated' => false]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('simulated', false));
});
