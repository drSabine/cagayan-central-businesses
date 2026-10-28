<?php

namespace App\Actions;

use App\Models\ActivityLog;
use App\Models\FocusTag;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CreateFocusTag
{
    public function handle(User $user, string $name): FocusTag
    {
        return DB::transaction(function () use ($user, $name): FocusTag {
            $tag = FocusTag::query()->create([
                'code' => Str::slug($name),
                'name' => $name,
                'sort_order' => (int) FocusTag::query()->max('sort_order') + 1,
            ]);
            ActivityLog::record('focus_tag_created', $user->id);

            return $tag;
        });
    }
}
