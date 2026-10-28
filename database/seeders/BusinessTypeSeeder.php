<?php

namespace Database\Seeders;

use App\Models\BusinessType;
use Illuminate\Database\Seeder;

/**
 * Starter list of types a resident would recognize. The PSIC section of each
 * still has to be checked against the PSA classification by the data member
 * (database.md, "business_types").
 */
class BusinessTypeSeeder extends Seeder
{
    /**
     * @var array<string, string>
     */
    private const array SECTIONS = [
        'A' => 'Agriculture, forestry and fishing',
        'C' => 'Manufacturing',
        'G' => 'Wholesale and retail trade; repair of motor vehicles and motorcycles',
        'I' => 'Accommodation and food service activities',
        'K' => 'Financial and insurance activities',
        'M' => 'Professional, scientific and technical activities',
        'P' => 'Education',
        'Q' => 'Human health and social work activities',
        'R' => 'Arts, entertainment and recreation',
        'S' => 'Other service activities',
    ];

    /**
     * @var list<array{0: string, 1: string, 2: string}>
     */
    private const array TYPES = [
        ['sari-sari-store', 'Sari-sari store', 'G'],
        ['grocery', 'Grocery', 'G'],
        ['pharmacy', 'Pharmacy', 'G'],
        ['hardware-store', 'Hardware store', 'G'],
        ['clothing-store', 'Clothing store', 'G'],
        ['school-supplies', 'School supplies and books', 'G'],
        ['auto-repair', 'Auto and motorcycle repair', 'G'],
        ['bakery', 'Bakery', 'C'],
        ['water-refilling', 'Water refilling station', 'C'],
        ['printing-shop', 'Printing shop', 'C'],
        ['coffee-shop', 'Coffee shop', 'I'],
        ['restaurant', 'Restaurant', 'I'],
        ['eatery', 'Carinderia or eatery', 'I'],
        ['boarding-house', 'Boarding house', 'I'],
        ['hotel', 'Hotel or inn', 'I'],
        ['bank', 'Bank', 'K'],
        ['lending', 'Lending or pawnshop', 'K'],
        ['veterinary-clinic', 'Veterinary clinic', 'M'],
        ['tutorial-center', 'Tutorial center', 'P'],
        ['clinic', 'Medical clinic', 'Q'],
        ['dental-clinic', 'Dental clinic', 'Q'],
        ['gym', 'Gym or fitness center', 'R'],
        ['salon', 'Salon or barbershop', 'S'],
        ['laundry', 'Laundry shop', 'S'],
        ['repair-shop', 'Gadget and appliance repair', 'S'],
        ['crop-farm', 'Rice and corn farm', 'A'],
        ['livestock-farm', 'Poultry and livestock farm', 'A'],
        ['fishpond', 'Fishpond or aquaculture', 'A'],
        ['agri-supply', 'Agricultural supply store', 'G'],
        ['rice-mill', 'Rice mill', 'C'],
    ];

    public function run(): void
    {
        foreach (self::TYPES as $order => [$code, $name, $section]) {
            BusinessType::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'psic_section' => $section,
                    'psic_section_name' => self::SECTIONS[$section],
                    'sort_order' => $order + 1,
                ],
            );
        }
    }
}
