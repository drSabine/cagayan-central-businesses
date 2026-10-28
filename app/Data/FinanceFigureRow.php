<?php

namespace App\Data;

/** A ledger figure as the Capitol review screen shows it. Reviewer and entrant identities are not sent. */
final readonly class FinanceFigureRow
{
    public function __construct(
        public string $id,
        public string $line,
        public string $label,
        public int $fiscalYear,
        public string $basis,
        public string $value,
        public ?string $variant,
        public string $source,
        public ?string $location,
        public string $status,
        public bool $manual,
        public bool $enteredByYou,
        public ?string $reviewedOn,
        public ?string $note,
        public string $group,
        public string $groupLabel,
        public ?string $sourceUrl,
    ) {}
}
