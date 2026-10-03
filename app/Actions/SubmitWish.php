<?php

namespace App\Actions;

use App\Models\BusinessType;
use App\Models\Municipality;
use App\Models\Wish;
use App\Services\WishAllowance;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

final class SubmitWish
{
    public function __construct(private WishAllowance $allowance) {}

    public function handle(Municipality $town, BusinessType $type, ?string $reason, string $submitterHash): Wish
    {
        // The lock stops two quick requests from both passing the cooldown check.
        return Cache::lock('wish:'.$submitterHash, 10)->block(5, function () use ($town, $type, $reason, $submitterHash): Wish {
            $nextWishAt = $this->allowance->nextWishAt($submitterHash);

            if ($nextWishAt !== null) {
                throw ValidationException::withMessages([
                    'wish' => __('You can add another wish on :date.', ['date' => $this->allowance->forDisplay($nextWishAt)]),
                ]);
            }

            return Wish::query()->create([
                'municipality_id' => $town->id,
                'business_type_id' => $type->id,
                'reason' => $reason,
                'submitter_hash' => $submitterHash,
            ]);
        });
    }
}
