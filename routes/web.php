<?php

use App\Http\Middleware\PreventIndexing;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

require __DIR__.'/public.php';

// The admin login lives only at the path in .env and is never linked from a public page
// (decisions.md, D20). GET and POST share the path, so the page posts to its own URL and
// the path never enters the JS bundle. Fortify's own routes are off (FortifyServiceProvider).
Route::middleware(['guest', PreventIndexing::class])->group(function () {
    Route::inertia(config('cagayan.admin.login_path'), 'auth/login')->name('capitol.login');
    Route::post(config('cagayan.admin.login_path'), [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('capitol.login.store');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
