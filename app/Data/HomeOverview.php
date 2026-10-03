<?php

namespace App\Data;

final readonly class HomeOverview
{
    public function __construct(
        public int $townCount,
        public int $connectedTownCount,
        public int $firstYear,
        public int $latestYear,
        public int $yearCount,
    ) {}
}
