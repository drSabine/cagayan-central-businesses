<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Fortify handles the login POST and logout. Its own pages are off (config/fortify.php, views).
Route::inertia('login', 'auth/login')->middleware('guest')->name('login');

Route::middleware('auth')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
