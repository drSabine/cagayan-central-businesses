<?php

namespace App\Data;

/**
 * One public figure for a town or the province. The value is a decimal
 * string. sourceUrl is null for province totals, which are sums.
 */
final readonly class TownFigure
{
    public function __construct(
        public string $value,
        public int $year,
        public ?string $sourceUrl,
    ) {}
}
