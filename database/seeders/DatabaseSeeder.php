<?php

namespace Database\Seeders;

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
            DemoAccountSeeder::class,
        ]);

        // Real public figures per town and per Tuguegarao barangay, from data/towns and data/barangays.
        $this->command->call('towns:import');
        $this->command->call('barangays:import');
    }
}
