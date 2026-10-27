<?php

namespace App\Data;

final readonly class FinancialHistory
{
    /**
     * @param  list<EconomicMetric>  $metrics
     * @param  list<array{year: int, observations: array<string, EconomicObservation>}>  $rows
     * @param  array{mode: string, label: string, sourceUrl: ?string, verifiedOn: ?string}  $source
     */
    public function __construct(
        public array $metrics,
        public array $rows,
        public string $axisMaximum,
        public array $source,
    ) {}
}
