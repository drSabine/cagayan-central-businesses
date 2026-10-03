<?php

namespace App\Queries;

use App\Data\HomeOverview;
use App\Models\Municipality;

final class HomeOverviewQuery
{
    public function get(): HomeOverview
    {
        /** @var object{total: int|string|null, connected: int|string|null}|null $towns */
        $towns = Municipality::query()
            ->toBase()
            ->selectRaw('count(*) as total, count(*) filter (where is_connected) as connected')
            ->first();

        return new HomeOverview(
            townCount: (int) ($towns->total ?? 0),
            connectedTownCount: (int) ($towns->connected ?? 0),
            firstYear: (int) config('cagayan.data.first_year'),
            latestYear: (int) config('cagayan.data.latest_year'),
            yearCount: (int) config('cagayan.data.latest_year') - (int) config('cagayan.data.first_year') + 1,
        );
    }
}
