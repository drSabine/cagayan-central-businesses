<?php

namespace App\Data;

final readonly class EconomicObservation
{
    public function __construct(
        public string $state,
        public ?string $value,
        public bool $comparable,
        public ?string $change,
        public ?float $percentageChange,
        public ?int $comparisonYear,
    ) {}
}
