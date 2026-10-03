<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Sleep;
use Throwable;

/**
 * Waits until the database accepts real queries.
 *
 * `docker compose up --wait` is not enough on the very first start: the image
 * runs a temporary server for its init scripts, the health check passes
 * against that one, and then it restarts. Migrating in that window fails
 * with "the database system is shutting down". `composer db:up` runs this
 * after Docker so `composer setup` works on a fresh clone.
 */
#[Signature('app:wait-for-db {--timeout=90 : Seconds to wait before giving up}')]
#[Description('Wait until the database accepts queries')]
class WaitForDatabaseCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $deadline = now()->addSeconds((int) $this->option('timeout'));
        $lastError = '';
        $consecutiveSuccesses = 0;

        while (now()->lt($deadline)) {
            try {
                DB::purge();
                DB::scalar('SELECT 1');

                // Two answers in a row, a second apart, so a server that is
                // about to restart after init is not mistaken for ready.
                if (++$consecutiveSuccesses >= 2) {
                    $this->components->info('The database is ready.');

                    return self::SUCCESS;
                }
            } catch (Throwable $e) {
                $consecutiveSuccesses = 0;
                $lastError = trim(strtok($e->getMessage(), "\n") ?: $e->getMessage());
            }

            Sleep::for(1)->second();
        }

        $this->components->error('The database did not become ready in time. '.$lastError);
        $this->line('  Fix: start Docker Desktop, run `composer db:up`, then `composer doctor`.');

        return self::FAILURE;
    }
}
