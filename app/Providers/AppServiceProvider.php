<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use RuntimeException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
        $this->guardAdminLoginPath();

        // D9. Checked on the whole Capitol route group (routes/capitol.php).
        Gate::define('capitol', fn (User $user): bool => $user->isCapitolAdmin());
    }

    /**
     * The network address is the key. It is held briefly in the cache and never written to a table.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('wishes', fn (Request $request) => Limit::perHour((int) config('cagayan.wishes.per_hour_per_ip'))->by((string) $request->ip()));
    }

    /**
     * The example login path is public in the repository, so production refuses to serve it (decisions.md, D20).
     */
    protected function guardAdminLoginPath(): void
    {
        // CI and `composer setup` boot the app from the console before `.env` exists.
        if (app()->runningInConsole()) {
            return;
        }

        $path = config('cagayan.admin.login_path');

        if (app()->isProduction() && (blank($path) || $path === 'staff-sign-in')) {
            throw new RuntimeException('Set CAGAYAN_ADMIN_LOGIN_PATH in .env to a long random value.');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // Lazy loading causes N+1 queries. Outside production it throws, so they are caught early.
        Model::preventLazyLoading(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
