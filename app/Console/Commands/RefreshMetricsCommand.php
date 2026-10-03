<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * Rebuilds every stats_ summary table from the raw records (decisions.md, D7).
 *
 * This is an empty shell until F4. The team adds one SQL file per summary
 * table under database/sql/metrics/ and runs them from here, in dependency
 * order, inside one transaction. Use the metric-builder skill.
 */
#[Signature('metrics:refresh')]
#[Description('Rebuild every summary table from the raw business records')]
class RefreshMetricsCommand extends Command
{
    /**
     * Where the time of the last successful refresh is kept. `app:doctor`
     * compares it with the newest business record to spot stale numbers.
     */
    private const STAMP_PATH = 'metrics/refreshed-at.txt';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->components->info('No summary tables exist yet. Nothing to refresh.');
        $this->line('  The first summary table, stats_area_year, is created with metric M1 (roadmap F4).');

        Storage::disk('local')->put(self::STAMP_PATH, now()->toIso8601String());

        return self::SUCCESS;
    }

    /**
     * The time the last refresh finished, or null if it never ran here.
     */
    public static function lastRefreshedAt(): ?Carbon
    {
        $stamp = Storage::disk('local')->get(self::STAMP_PATH);

        return $stamp ? Carbon::parse(trim($stamp)) : null;
    }
}
