<?php

use App\Models\User;

// D20. A redirect to login would reveal the login path, so guests get a plain 404.

test('guests get a not found page instead of a redirect to login', function () {
    $this->get(route('dashboard'))->assertNotFound();
});

test('administrators can visit the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk();
});
