<?php

use App\Http\Controllers\Capitol\ActivityLogController;
use App\Http\Controllers\Capitol\CommunityWishController;
use App\Http\Controllers\Capitol\DashboardController;
use App\Http\Controllers\Capitol\FinanceFigureController;
use App\Http\Controllers\Capitol\FinanceReviewController;
use App\Http\Controllers\Capitol\ProfileController;
use App\Http\Controllers\Capitol\SessionActivityController;
use App\Http\Middleware\PreventIndexing;
use Illuminate\Support\Facades\Route;

Route::middleware([PreventIndexing::class, 'auth', 'can:capitol'])
    ->prefix('capitol')->name('capitol.')->group(function (): void {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::post('session-activity', SessionActivityController::class)->middleware('throttle:workspace-activity')->name('session.activity');
        Route::get('community-wishes', CommunityWishController::class)->middleware('can:community-wishes')->name('wishes.index');
        Route::get('activity-logs', ActivityLogController::class)->middleware('can:activity-logs')->name('logs.index');
        Route::get('finances', [FinanceReviewController::class, 'index'])->name('finances.index');
        Route::get('finances/{town:psgc_code}/{year}', [FinanceReviewController::class, 'show'])->whereNumber('year')->name('finances.show');
        Route::post('finances/{town:psgc_code}/{year}/figures', [FinanceFigureController::class, 'store'])->whereNumber('year')->name('finances.figures.store');
        Route::post('finances/{town:psgc_code}/{year}/reviews', [FinanceReviewController::class, 'store'])->whereNumber('year')->middleware('can:finance-review')->name('finances.reviews.store');
        Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    });
