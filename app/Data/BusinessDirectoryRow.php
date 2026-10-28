<?php

namespace App\Data;

/** Public-class fields only (privacy-rules.md, "Field classes"): no owner, contact, size, employees or sales. */
final readonly class BusinessDirectoryRow
{
    /**
     * @param  string  $category  Business Category code
     * @param  ?string  $status  Latest year status: new, renewed, not_renewed or closed
     */
    public function __construct(
        public string $name,
        public string $type,
        public string $category,
        public string $industry,
        public string $barangay,
        public int $yearEstablished,
        public ?string $status,
    ) {}
}
