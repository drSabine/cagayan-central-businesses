<?php

namespace App\Actions;

use App\Models\ActivityLog;
use App\Models\BusinessType;
use App\Models\FocusTag;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class UpdateBusinessTypeTags
{
    /**
     * @param  list<string>  $tagCodes
     */
    public function handle(User $user, BusinessType $type, array $tagCodes): void
    {
        DB::transaction(function () use ($user, $type, $tagCodes): void {
            $type->focusTags()->sync(FocusTag::query()->whereIn('code', $tagCodes)->pluck('id')->all());
            ActivityLog::record('business_type_tags_updated', $user->id);
        });
    }
}
