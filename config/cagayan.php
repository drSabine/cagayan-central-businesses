<?php

/*
|--------------------------------------------------------------------------
| Cagayan Business
|--------------------------------------------------------------------------
|
| Every threshold the product uses lives here, never as a literal in PHP,
| SQL, or React. The values and their meaning come from
| docs/engineering/metrics.md and docs/engineering/privacy-rules.md.
| Values marked "open decision" are defaults from decisions.md that the
| team still has to confirm with the adviser.
|
*/

return [

    /*
    | Drives the "Simulated data" label on every screen and export (P13).
    */
    'simulated' => (bool) env('CAGAYAN_SIMULATED', true),

    'privacy' => [

        /*
        | P2. A sales figure for fewer active businesses than this is hidden.
        */
        'small_group_min' => 5,

        /*
        | P3. A sales figure is hidden when the largest single business holds
        | more than this share of the group's total. Open decision O3.
        */
        'dominance_max_share' => 0.70,

        /*
        | M15. Lower edges of the public sales bands, in pesos, ascending.
        | The first band is "under" the first edge, the last is "over" the
        | last edge. Open decision O2.
        */
        'sales_bands' => [
            10_000_000,
            50_000_000,
            100_000_000,
            500_000_000,
            1_000_000_000,
        ],

    ],

    'peer' => [

        /*
        | M16. "Below peer average" when density < median * (1 - margin).
        | Open decision O4.
        */
        'margin' => 0.20,

    ],

    'outlook' => [

        /*
        | M11, M12. How many recent years the middle estimate averages.
        | Open decision O7.
        */
        'lookback_years' => 3,

    ],

    'early_warning' => [

        /*
        | M14. Minimum non-renewals in the latest year before a rising trend
        | raises a flag, so tiny counts do not trigger it.
        */
        'min_non_renewals' => 3,

    ],

    'specialization' => [

        /*
        | M8. Minimum active businesses of a type in a barangay before its
        | specialization is shown.
        */
        'min_type_count' => 3,

    ],

    'data' => [

        'first_year' => 2020,

        'latest_year' => 2026,

    ],

    /*
    | Dates written into messages, such as a wish cooldown, use residents'
    | local time. The database stores UTC.
    */
    'display_timezone' => 'Asia/Manila',

    'admin' => [

        /*
        | D20. The login page lives at this path and nowhere else. It is never
        | linked from a public page. Set a long random value in .env on any
        | machine others can reach.
        */
        'login_path' => env('CAGAYAN_ADMIN_LOGIN_PATH', 'staff-sign-in'),

        /*
        | Login attempts allowed per email and network address per minute, and
        | per network address per hour.
        */
        'login_per_minute' => 5,

        'login_per_hour_per_ip' => 20,

        /*
        | Lockout. Failed attempts on one account per hour from any address.
        */
        'login_per_hour_per_account' => 10,

    ],

    'wishes' => [

        /*
        | D21 and P12. Days a browser waits between two new wishes.
        */
        'cooldown_days' => 3,

        /*
        | Edits a browser may make within the rolling edit window.
        */
        'edits_per_window' => 3,

        'edit_window_days' => 7,

        /*
        | Wish submissions and edits per network address per hour. The address
        | is held in the cache only, never written to a table.
        */
        'per_hour_per_ip' => 10,

        /*
        | New respondents (browsers with no earlier suggestion) one network may
        | create per day, counted by the daily network hash. Stops clearing
        | cookies from becoming a way around the cooldown, while a shared
        | network such as a school or the booth wifi still works.
        */
        'new_respondents_per_network_per_day' => 25,

        /*
        | Bot check. A signed timestamp issued with the form must be at least
        | this old when the form comes back, and not older than the maximum.
        */
        'min_fill_seconds' => 3,

        'max_fill_minutes' => 120,

        /*
        | Lifetime of the anonymous submitter cookie.
        */
        'cookie_days' => 30,

        'reason_max' => 280,

    ],

    /*
    | The administrator the seeder creates for the demo. The password comes
    | from .env and is never written in code (database.md, seeder item 11).
    */
    'demo_admin' => [
        'email' => env('DEMO_ADMIN_EMAIL'),
        'password' => env('DEMO_ADMIN_PASSWORD'),
    ],

];
