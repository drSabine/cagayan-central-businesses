<?php

use App\Http\Controllers\EconomicPerformanceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\WishController;
use Illuminate\Support\Facades\Route;

// Public pages need no login and never receive admin fields (privacy-rules.md, P8).
Route::get('/', HomeController::class)->name('home');

Route::name('public.')->group(function () {
    Route::get('economic-performance', EconomicPerformanceController::class)->name('economic-performance');
    Route::get('wishes', [WishController::class, 'index'])->name('wishes.index');
    Route::post('wishes', [WishController::class, 'store'])->middleware('throttle:wishes')->name('wishes.store');
    Route::put('wishes/{wish}', [WishController::class, 'update'])->middleware('throttle:wishes')->name('wishes.update');
});
