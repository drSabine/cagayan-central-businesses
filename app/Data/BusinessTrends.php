<?php

namespace App\Data;

/**
 * Simulated business counts and guarded declared sales by industry or Focus Tag for the connected town (M28 to M31).
 */
final readonly class BusinessTrends
{
    /**
     * @param  array{industry: list<SelectOption>, tag: list<SelectOption>}  $groups
     * @param  array<string, array{counts: FinancialHistory, sales: FinancialHistory, share: FinancialHistory}>  $datasets  keyed "industry:A", "tag:fishery"
     */
    public function __construct(
        public string $townCode,
        public string $townName,
        public array $groups,
        public array $datasets,
    ) {}
}
