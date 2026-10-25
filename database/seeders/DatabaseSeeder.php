<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Towns and their public figures, business types, and demo wishes so far. The simulated
     * business data comes with roadmap F3 (database.md, "Seeder
     * requirements").
     */
    public function run(): void
    {
        $this->call([
            MunicipalitySeeder::class,
            BarangaySeeder::class,
            BusinessTypeSeeder::class,
            WishSeeder::class,
        ]);

        // Real public figures per town and per Tuguegarao barangay, from data/towns and data/barangays.
        $this->command->call('towns:import');
        $this->command->call('barangays:import');

        $this->seedDemoAdmin();
    }

    /**
     * The administrator used for the demo. Email and password come from .env
     * (DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD) and are never written in code.
     */
    private function seedDemoAdmin(): void
    {
        $email = config('cagayan.demo_admin.email');
        $password = config('cagayan.demo_admin.password');

        if (blank($email) || blank($password)) {
            $this->command->warn('DEMO_ADMIN_EMAIL or DEMO_ADMIN_PASSWORD is empty in .env. No administrator was created.');

            return;
        }

        $admin = User::query()->firstOrNew(['email' => $email]);
        if ($admin->exists) {
            return;
        }
        $admin->fill(['name' => config('cagayan.demo_admin.name'), 'password' => $password]);
        // role is never fillable (D9), so it is forced here.
        $admin->forceFill(['email_verified_at' => now(), 'role' => UserRole::Admin])->save();
    }
}
