<?php

namespace App\Data;

final readonly class EconomicPerformance
{
    /**
     * @param  list<SelectOption>  $towns
     * @param  array{town: string, period: string, wishView: string}  $filters
     * @param  array<string, int>  $periods
     * @param  array<string, array{finances: FinancialHistory, wishes: CommunityWishSnapshot}>  $datasets
     */
    public function __construct(
        public array $towns,
        public array $filters,
        public array $periods,
        public array $datasets,
    ) {}
}
