<?php

namespace App\Console\Commands;

use RuntimeException;

/**
 * A failed doctor check: what is wrong, and the exact fix to print.
 */
class DoctorFailure extends RuntimeException
{
    public function __construct(string $problem, public readonly string $fix)
    {
        parent::__construct($problem);
    }
}
