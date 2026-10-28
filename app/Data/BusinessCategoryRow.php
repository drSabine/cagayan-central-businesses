<?php

namespace App\Data;

final readonly class BusinessCategoryRow
{
    /**
     * @param  list<string>  $tags  Focus Tag codes
     */
    public function __construct(
        public string $code,
        public string $name,
        public string $industry,
        public array $tags,
    ) {}
}
