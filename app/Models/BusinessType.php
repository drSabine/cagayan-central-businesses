<?php

namespace App\Models;

use Database\Factories\BusinessTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $psic_section
 * @property string $psic_section_name
 * @property int $sort_order
 */
#[Fillable(['code', 'name', 'psic_section', 'psic_section_name', 'sort_order'])]
class BusinessType extends Model
{
    /** @use HasFactory<BusinessTypeFactory> */
    use HasFactory;

    /**
     * @return HasMany<Wish, $this>
     */
    public function wishes(): HasMany
    {
        return $this->hasMany(Wish::class);
    }

    /**
     * @return BelongsToMany<FocusTag, $this>
     */
    public function focusTags(): BelongsToMany
    {
        return $this->belongsToMany(FocusTag::class);
    }
}
