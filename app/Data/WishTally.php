<?php

namespace App\Data;

/**
 * M17. Wishes for one type in one town, beside what is registered there.
 * registeredCount stays null until business records exist (roadmap F4),
 * and the page shows "Not available", never 0.
 */
final readonly class WishTally
{
    public function __construct(
        public string $townName,
        public string $typeName,
        public int $wishCount,
        public ?int $registeredCount,
    ) {}
}
