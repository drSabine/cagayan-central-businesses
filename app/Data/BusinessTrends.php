<?php

namespace App\Data;

/**
 * Simulated business counts and guarded declared sales by industry or Business Category for the connected town (M28 to M31).
 */
final readonly class BusinessTrends
{
    /**
     * @param  array{industry: list<SelectOption>, category: list<SelectOption>}  $groups
     * @param  array<string, array{counts: FinancialHistory, sales: FinancialHistory, share: FinancialHistory}>  $datasets  keyed "industry:A", "category:fishery"
     */
    public function __construct(
        public string $townCode,
        public string $townName,
        public array $groups,
        public array $datasets,
    ) {}
}
