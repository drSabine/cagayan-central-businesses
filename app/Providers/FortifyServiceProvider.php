<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Login and logout are registered in routes/web.php at the secret path (decisions.md, D20).
        Fortify::ignoreRoutes();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->string(Fortify::username())->toString()).'|'.$request->ip());

            return [
                Limit::perMinute((int) config('cagayan.admin.login_per_minute'))->by($throttleKey),
                Limit::perHour((int) config('cagayan.admin.login_per_hour_per_ip'))->by('ip|'.$request->ip()),
            ];
        });
    }
}
