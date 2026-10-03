<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use App\Models\Municipality;
use App\Models\Wish;
use Illuminate\Database\Seeder;

/**
 * Demo wishes for Tuguegarao City, with pharmacy wished for often
 * (database.md, seeder item 10). Fixed counts so every laptop shows the same.
 */
class WishSeeder extends Seeder
{
    /**
     * @var array<string, int>
     */
    private const array COUNTS = [
        'pharmacy' => 14,
        'hardware-store' => 9,
        'coffee-shop' => 6,
        'bank' => 4,
        'tutorial-center' => 3,
        'gym' => 2,
    ];

    public function run(): void
    {
        $town = Municipality::query()->where('psgc_code', '0201529000')->firstOrFail();
        $types = BusinessType::query()->whereIn('code', array_keys(self::COUNTS))->pluck('id', 'code');

        Wish::query()->where('submitter_hash', 'like', 'seed-%')->delete();

        foreach (self::COUNTS as $code => $count) {
            foreach (range(1, $count) as $index) {
                Wish::query()->create([
                    'municipality_id' => $town->id,
                    'business_type_id' => $types[$code],
                    'reason' => null,
                    'submitter_hash' => "seed-{$code}-{$index}",
                ]);
            }
        }
    }
}
