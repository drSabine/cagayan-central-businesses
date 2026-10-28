<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\BusinessType;
use App\Models\Municipality;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Simulated businesses for Tuguegarao City, 2020 to 2026, labeled "Simulated data" (D10).
 * It meets database.md "Seeder requirements" 3 to 6 and 9, and follows the business_years status rules.
 */
class SimulatedBusinessSeeder extends Seeder
{
    /** Relative weights; farms and agri-supply weigh more in less populous barangays. */
    private const array WEIGHTS = [
        'sari-sari-store' => 30, 'eatery' => 12, 'grocery' => 6, 'pharmacy' => 4, 'hardware-store' => 3,
        'clothing-store' => 5, 'school-supplies' => 3, 'auto-repair' => 4, 'bakery' => 5, 'water-refilling' => 4,
        'printing-shop' => 2, 'coffee-shop' => 4, 'restaurant' => 4, 'boarding-house' => 4, 'hotel' => 1,
        'bank' => 1, 'lending' => 3, 'veterinary-clinic' => 1, 'tutorial-center' => 2, 'clinic' => 2,
        'dental-clinic' => 2, 'gym' => 1, 'salon' => 6, 'laundry' => 3, 'repair-shop' => 3,
        'crop-farm' => 4, 'livestock-farm' => 3, 'fishpond' => 1, 'agri-supply' => 2, 'rice-mill' => 1,
    ];

    private const array RURAL_TYPES = ['crop-farm', 'livestock-farm', 'fishpond', 'agri-supply', 'rice-mill'];

    /** @var array<string, array{0: int, 1: int, 2: int, 3: int}> lowest and highest yearly sales, then employees */
    private const array SIZES = [
        'micro' => [200_000, 2_500_000, 1, 9],
        'small' => [3_000_000, 15_000_000, 10, 49],
        'medium' => [15_000_000, 60_000_000, 50, 199],
    ];

    public function run(): void
    {
        $seed = (int) config('cagayan.simulation.seed');
        mt_srand($seed);
        $faker = Faker::create('en_PH');
        $faker->seed($seed);

        $town = Municipality::query()->where('psgc_code', config('cagayan.performance.demo_town'))->firstOrFail();
        $barangays = Barangay::query()->where('municipality_id', $town->id)->whereNotNull('boundary')
            ->orderBy('psgc_code')->get(['id', 'population']);
        $types = BusinessType::query()->pluck('id', 'code');
        $first = (int) config('cagayan.data.first_year');
        $last = (int) config('cagayan.data.latest_year');
        $medianPopulation = $barangays->pluck('population')->filter()->median() ?? 0;

        // Requirement 5: the least populous barangay keeps a small group. Requirement 6: one barangay has a dominant business.
        $smallest = $barangays->sortBy('population')->first()?->id;
        $dominant = $barangays->sortBy('population')->values()->get(intdiv($barangays->count(), 2))?->id;

        $businesses = [];
        $histories = [];
        $now = now();
        foreach ($barangays as $barangay) {
            $count = $barangay->id === $smallest
                ? (int) config('cagayan.simulation.minimum_per_barangay')
                : max((int) config('cagayan.simulation.minimum_per_barangay'), (int) round(($barangay->population ?? 0) / 1000 * (int) config('cagayan.simulation.businesses_per_thousand_residents')));
            $rural = ($barangay->population ?? 0) < $medianPopulation;

            for ($i = 0; $i < $count; $i++) {
                $code = $this->pickType($rural);
                $isDominant = $barangay->id === $dominant && $i === 0;
                $size = $isDominant ? 'medium' : $this->pickSize();
                [$low, $high, $minStaff, $maxStaff] = self::SIZES[$size];
                $established = $isDominant || mt_rand(1, 10) <= 3 ? mt_rand(2000, $first - 1) : mt_rand($first, $last);
                $publicId = (string) Str::uuid();

                $businesses[] = [
                    'public_id' => $publicId,
                    'business_name' => Str::limit($faker->company(), 55, ''),
                    'business_type_id' => $types[$code],
                    'description' => Str::limit($faker->sentence(10), 280, ''),
                    'year_established' => $established,
                    'barangay_id' => $barangay->id,
                    'location' => DB::raw('ST_SetSRID(ST_MakePoint(0, 0), 4326)'),
                    'owner_name' => Str::limit($faker->name(), 80, ''),
                    'contact_number' => '09'.str_pad((string) mt_rand(0, 999_999_999), 9, '0', STR_PAD_LEFT),
                    'ownership_type' => $this->pick(['sole_proprietorship' => 80, 'partnership' => 8, 'corporation' => 8, 'cooperative' => 4]),
                    'size_category' => $size,
                    'employee_count' => mt_rand($minStaff, $maxStaff),
                    'is_simulated' => true,
                    'source' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $histories[$publicId] = $this->history($established, $first, $last, $isDominant ? 400_000_000 : mt_rand($low, $high), $isDominant);
            }
        }

        DB::transaction(function () use ($businesses, $histories, $now): void {
            foreach (array_chunk($businesses, 300) as $chunk) {
                DB::table('businesses')->insert($chunk);
            }
            $ids = DB::table('businesses')->pluck('id', 'public_id');
            $rows = [];
            foreach ($histories as $publicId => $years) {
                foreach ($years as $year) {
                    $rows[] = $year + ['business_id' => $ids[$publicId], 'created_at' => $now, 'updated_at' => $now];
                }
            }
            foreach (array_chunk($rows, 1000) as $chunk) {
                DB::table('business_years')->insert($chunk);
            }
            // Requirement 9: one point inside each business's barangay, seeded by the business id so reruns match.
            DB::statement('update businesses b set location = ST_GeometryN(ST_GeneratePoints(g.boundary, 1, b.id::int), 1)
                from barangays g where g.id = b.barangay_id');
        });
    }

    /**
     * Status rules 1 to 3 in database.md: first row new or renewed, then renewed until one non-renewal or closure.
     *
     * @return list<array{year: int, status: string, declared_gross_sales: string|null}>
     */
    private function history(int $established, int $first, int $last, int $sales, bool $alwaysRenews = false): array
    {
        $years = [];
        for ($year = max($established, $first); $year <= $last; $year++) {
            $status = $years === []
                ? ($established >= $first ? 'new' : 'renewed')
                : ($alwaysRenews ? 'renewed' : $this->pick(['renewed' => 92, 'not_renewed' => 6, 'closed' => 2]));
            $active = in_array($status, ['new', 'renewed'], true);
            $years[] = ['year' => $year, 'status' => $status, 'declared_gross_sales' => $active ? number_format($sales, 2, '.', '') : null];
            if (! $active) {
                break;
            }
            $sales = (int) round($sales * (1 + mt_rand(-5, 12) / 100));
        }

        return $years;
    }

    private function pickType(bool $rural): string
    {
        $weights = self::WEIGHTS;
        foreach (self::RURAL_TYPES as $code) {
            $weights[$code] *= $rural ? 3 : 1;
        }

        return $this->pick($weights);
    }

    private function pickSize(): string
    {
        return $this->pick(['micro' => 75, 'small' => 21, 'medium' => 4]);
    }

    /**
     * @param  array<string, int>  $weights
     */
    private function pick(array $weights): string
    {
        $roll = mt_rand(1, array_sum($weights));
        foreach ($weights as $value => $weight) {
            if (($roll -= $weight) <= 0) {
                return $value;
            }
        }

        return (string) array_key_last($weights);
    }
}
