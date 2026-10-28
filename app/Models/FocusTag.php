<?php

namespace App\Models;

use Database\Factories\FocusTagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * An admin-managed grouping of Business Types, such as Agriculture or Fishery (D36).
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $sort_order
 */
#[Fillable(['code', 'name', 'sort_order'])]
class FocusTag extends Model
{
    /** @use HasFactory<FocusTagFactory> */
    use HasFactory;

    /**
     * @return BelongsToMany<BusinessType, $this>
     */
    public function businessTypes(): BelongsToMany
    {
        return $this->belongsToMany(BusinessType::class);
    }
}
