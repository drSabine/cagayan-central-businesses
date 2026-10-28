<?php

namespace App\Models;

use App\Enums\OwnershipType;
use App\Enums\SizeCategory;
use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One registered business. Owner, contact, ownership, size and employees are admin fields (P8).
 *
 * @property int $id
 * @property string $public_id
 * @property string $business_name
 * @property int $business_type_id
 * @property string $description
 * @property int $year_established
 * @property int $barangay_id
 * @property string $owner_name
 * @property string $contact_number
 * @property OwnershipType $ownership_type
 * @property SizeCategory $size_category
 * @property int $employee_count
 * @property bool $is_simulated
 * @property string|null $source
 */
#[Fillable([
    'public_id', 'business_name', 'business_type_id', 'description', 'year_established', 'barangay_id', 'location',
    'owner_name', 'contact_number', 'ownership_type', 'size_category', 'employee_count', 'is_simulated', 'source',
])]
#[Hidden(['location'])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<BusinessType, $this>
     */
    public function businessType(): BelongsTo
    {
        return $this->belongsTo(BusinessType::class);
    }

    /**
     * @return BelongsTo<Barangay, $this>
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * @return HasMany<BusinessYear, $this>
     */
    public function years(): HasMany
    {
        return $this->hasMany(BusinessYear::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year_established' => 'integer',
            'ownership_type' => OwnershipType::class,
            'size_category' => SizeCategory::class,
            'employee_count' => 'integer',
            'is_simulated' => 'boolean',
        ];
    }
}
