<?php

namespace App\Data;

final readonly class WorkspaceTable
{
    /** @param list<array<string, string|int|null>> $rows
     * @param  list<SelectOption>  $towns
     * @param  list<SelectOption>  $categories
     * @param  array<string, string|null>  $filters
     */
    public function __construct(
        public array $rows, public ?string $previous, public ?string $next,
        public int $page, public array $towns = [], public array $categories = [], public array $filters = [],
    ) {}
}
