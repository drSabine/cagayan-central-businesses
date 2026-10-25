<?php

namespace App\Data;

final readonly class WorkspaceMap
{
    /** @param list<BarangayProfile> $barangays */
    public function __construct(public TownAtlas $atlas, public array $barangays) {}
}
