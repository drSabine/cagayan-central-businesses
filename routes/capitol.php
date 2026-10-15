<?php

use Illuminate\Support\Facades\Route;

// D9. Every Capitol route sits in this one group, so none can be left open by mistake.
// Guests get a 404 (bootstrap/app.php). Logged-in accounts without the role get a 403.
Route::middleware(['auth', 'can:capitol'])
    ->prefix('capitol')
    ->name('capitol.')
    ->group(function () {
        Route::inertia('/', 'capitol/dashboard')->name('dashboard');
    });
