<?php

// Finished synthetic observations, never imported into verified town facts.
return [
    'finances' => [
        'source' => ['mode' => 'simulated', 'label' => 'Synthetic demonstration figures', 'sourceUrl' => null, 'verifiedOn' => null],
        'axisMaximum' => '4000000000.00',
        'metrics' => [
            ['id' => 'government_revenue', 'label' => 'Government Revenue', 'unit' => 'PHP', 'basis' => 'Accrual revenue'],
            ['id' => 'government_expenses', 'label' => 'Government Expenses', 'unit' => 'PHP', 'basis' => 'Accrual expenses including non-cash expenses and transfers'],
        ],
        'rows' => [
            ['year' => 2021, 'observations' => [
                'government_revenue' => ['state' => 'shown', 'value' => '2400000000.25', 'comparable' => false, 'change' => null, 'percentageChange' => null, 'comparisonYear' => null],
                'government_expenses' => ['state' => 'shown', 'value' => '2100000000.50', 'comparable' => false, 'change' => null, 'percentageChange' => null, 'comparisonYear' => null],
            ]],
            ['year' => 2022, 'observations' => [
                'government_revenue' => ['state' => 'shown', 'value' => '2640000000.25', 'comparable' => true, 'change' => '240000000.00', 'percentageChange' => 10.0, 'comparisonYear' => 2021],
                'government_expenses' => ['state' => 'shown', 'value' => '2310000000.50', 'comparable' => true, 'change' => '210000000.00', 'percentageChange' => 10.0, 'comparisonYear' => 2021],
            ]],
            ['year' => 2023, 'observations' => [
                'government_revenue' => ['state' => 'shown', 'value' => '2904000000.25', 'comparable' => true, 'change' => '264000000.00', 'percentageChange' => 10.0, 'comparisonYear' => 2022],
                'government_expenses' => ['state' => 'shown', 'value' => '2194500000.50', 'comparable' => true, 'change' => '-115500000.00', 'percentageChange' => -5.0, 'comparisonYear' => 2022],
            ]],
            ['year' => 2024, 'observations' => [
                'government_revenue' => ['state' => 'shown', 'value' => '3194400000.25', 'comparable' => true, 'change' => '290400000.00', 'percentageChange' => 10.0, 'comparisonYear' => 2023],
                'government_expenses' => ['state' => 'shown', 'value' => '2523675000.50', 'comparable' => true, 'change' => '329175000.00', 'percentageChange' => 15.0, 'comparisonYear' => 2023],
            ]],
            ['year' => 2025, 'observations' => [
                'government_revenue' => ['state' => 'shown', 'value' => '3513840000.25', 'comparable' => true, 'change' => '319440000.00', 'percentageChange' => 10.0, 'comparisonYear' => 2024],
                'government_expenses' => ['state' => 'shown', 'value' => '2776042500.50', 'comparable' => true, 'change' => '252367500.00', 'percentageChange' => 10.0, 'comparisonYear' => 2024],
            ]],
        ],
    ],
    'wishes' => [
        'asOf' => '2026-10-25',
        'period' => 'All Time',
        'source' => 'Curated synthetic wishes and fictional business names',
        'types' => [
            ['id' => 'pharmacy', 'label' => 'Pharmacy', 'count' => 84],
            ['id' => 'grocery', 'label' => 'Grocery', 'count' => 72],
            ['id' => 'coffee-shop', 'label' => 'Coffee Shop', 'count' => 64],
            ['id' => 'water-refilling-station', 'label' => 'Water Refilling Station', 'count' => 57],
            ['id' => 'bookshop', 'label' => 'Bookshop', 'count' => 49],
            ['id' => 'laundry-shop', 'label' => 'Laundry Shop', 'count' => 43],
            ['id' => 'hardware-store', 'label' => 'Hardware Store', 'count' => 39],
            ['id' => 'bakery', 'label' => 'Bakery', 'count' => 36],
            ['id' => 'dental-clinic', 'label' => 'Dental Clinic', 'count' => 31],
            ['id' => 'veterinary-clinic', 'label' => 'Veterinary Clinic', 'count' => 31],
            ['id' => 'school-supplies', 'label' => 'School Supplies', 'count' => 28],
            ['id' => 'repair-shop', 'label' => 'Repair Shop', 'count' => 24],
            ['id' => 'farm-supplies', 'label' => 'Farm Supplies', 'count' => 21],
            ['id' => 'printing-shop', 'label' => 'Printing Shop', 'count' => 18],
            ['id' => 'fitness-center', 'label' => 'Fitness Center', 'count' => 15],
            ['id' => 'tutorial-center', 'label' => 'Tutorial Center', 'count' => 12],
            ['id' => 'local-crafts-store', 'label' => 'Local Crafts Store', 'count' => 9],
            ['id' => 'fresh-produce-market', 'label' => 'Fresh Produce Market', 'count' => 8],
        ],
        'specific' => [
            ['id' => 'northbank-coffee', 'label' => 'Northbank Coffee', 'count' => 42],
            ['id' => 'valley-books', 'label' => 'Valley Books', 'count' => 36],
            ['id' => 'cagayan-fresh-market', 'label' => 'Cagayan Fresh Market', 'count' => 30],
            ['id' => 'riverbend-pharmacy', 'label' => 'Riverbend Pharmacy', 'count' => 27],
            ['id' => 'greenfields-farm-supplies', 'label' => 'Greenfields Farm Supplies', 'count' => 23],
            ['id' => 'northstar-repair-center', 'label' => 'Northstar Repair Center', 'count' => 18],
            ['id' => 'sunrise-bakery', 'label' => 'Sunrise Bakery', 'count' => 15],
            ['id' => 'townside-laundry', 'label' => 'Townside Laundry', 'count' => 11],
        ],
    ],
];
