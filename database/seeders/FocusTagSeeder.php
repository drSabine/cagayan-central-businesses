<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use App\Models\FocusTag;
use Illuminate\Database\Seeder;

/**
 * Starter Focus Tags (D36). Admins change tags and their Business Types on the Business Categories page.
 */
class FocusTagSeeder extends Seeder
{
    /**
     * @var array<string, array{0: string, 1: list<string>}>
     */
    private const array TAGS = [
        'agriculture' => ['Agriculture', ['crop-farm', 'livestock-farm', 'agri-supply', 'rice-mill', 'veterinary-clinic']],
        'fishery' => ['Fishery', ['fishpond']],
        'tourism' => ['Tourism', ['hotel', 'restaurant', 'coffee-shop', 'boarding-house']],
        'food-processing' => ['Food Processing', ['bakery', 'rice-mill', 'water-refilling']],
    ];

    public function run(): void
    {
        $types = BusinessType::query()->pluck('id', 'code');

        foreach (array_keys(self::TAGS) as $order => $code) {
            [$name, $typeCodes] = self::TAGS[$code];
            $tag = FocusTag::query()->firstOrCreate(['code' => $code], ['name' => $name, 'sort_order' => $order + 1]);
            if ($tag->wasRecentlyCreated) {
                $tag->businessTypes()->sync($types->only($typeCodes)->values()->all());
            }
        }
    }
}
