<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Only event codes and actor keys belong in this append-only stream. */
final class ActivityLog
{
    public const array EVENTS = [
        'signed_in' => 'Signed In', 'signed_out' => 'Signed Out',
        'sign_in_failed' => 'Sign In Failed', 'session_expired' => 'Session Ended',
        'profile_updated' => 'Profile Updated', 'role_assigned_from_console' => 'Role Assigned from Console',
    ];

    public static function record(string $event, ?int $actorId): void
    {
        DB::table('activity_logs')->insert([
            'id' => (string) Str::uuid(),
            'actor_id' => $actorId,
            'event' => $event,
            'occurred_at' => now(),
        ]);
    }
}
