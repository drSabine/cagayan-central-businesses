<?php

namespace App\Models;

use App\Enums\FinanceAvailability;
use App\Enums\FinanceDocumentKind;
use Database\Factories\FinanceDocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A COA report for one town and fiscal year, or the record that COA had not published it.
 *
 * @property int $id
 * @property int $municipality_id
 * @property int $fiscal_year
 * @property FinanceDocumentKind $kind
 * @property FinanceAvailability $availability
 * @property string|null $file
 * @property string|null $source_url
 * @property string|null $sha256
 * @property Carbon $checked_on
 */
#[Fillable(['municipality_id', 'fiscal_year', 'kind', 'availability', 'file', 'source_url', 'sha256', 'checked_on'])]
class FinanceDocument extends Model
{
    /** @use HasFactory<FinanceDocumentFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Municipality, $this>
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fiscal_year' => 'integer',
            'kind' => FinanceDocumentKind::class,
            'availability' => FinanceAvailability::class,
            'checked_on' => 'date',
        ];
    }
}
