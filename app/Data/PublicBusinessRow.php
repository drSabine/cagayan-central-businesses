<?php

namespace App\Data;

/** One approved business on the public directory, kept to what a list row renders (P8, P15). */
final readonly class PublicBusinessRow
{
    /**
     * @param  array{0: float, 1: float}|null  $point  Longitude and latitude, storefronts only
     */
    public function __construct(
        public string $id,
        public string $name,
        public string $category,
        public string $barangay,
        public bool $isNew,
        public bool $bir,
        public ?array $point,
    ) {}
}
