<?php

namespace App\Data;

/** Every Business Type with its PSIC industry and Focus Tags (D36). The list is small, so filtering is local. */
final readonly class BusinessCategories
{
    /**
     * @param  list<BusinessCategoryRow>  $types
     * @param  list<SelectOption>  $tags
     */
    public function __construct(
        public array $types,
        public array $tags,
        public ?string $tag,
        public int $tagNameMax,
    ) {}
}
