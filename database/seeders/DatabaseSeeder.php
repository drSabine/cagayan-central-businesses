<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * For now this only creates the demo administrator. The simulated
     * business data comes with roadmap F3 (database.md, "Seeder
     * requirements"), and the capitol_admin role with F1.
     */
    public function run(): void
    {
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
        $admin->fill(['name' => 'Capitol Administrator', 'password' => $password]);
        $admin->forceFill(['email_verified_at' => now()])->save();
    }
}
