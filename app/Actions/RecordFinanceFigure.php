<?php

namespace App\Actions;

use App\Enums\FinanceAvailability;
use App\Enums\FinanceEntryMethod;
use App\Enums\FinanceFigureStatus;
use App\Models\ActivityLog;
use App\Models\FinanceDocument;
use App\Models\FinanceFigure;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** A figure typed in by hand. It stays pending until someone else signs it off (D35). */
final class RecordFinanceFigure
{
    /**
     * @param  array{line_code: string, fiscal_year: int, basis: string, value: string, document_kind: string|null, source_url: string|null}  $input
     */
    public function handle(User $user, Municipality $town, int $reportYear, array $input): FinanceFigure
    {
        return DB::transaction(function () use ($user, $town, $reportYear, $input): FinanceFigure {
            $document = $input['document_kind'] === null ? null : FinanceDocument::query()
                ->where('municipality_id', $town->id)->where('fiscal_year', $reportYear)
                ->where('kind', $input['document_kind'])->where('availability', FinanceAvailability::Available)
                ->firstOrFail();

            $figure = FinanceFigure::query()->create([
                'public_id' => (string) Str::uuid(),
                'municipality_id' => $town->id,
                'fiscal_year' => $input['fiscal_year'],
                'line_code' => $input['line_code'],
                'basis' => $input['basis'],
                'value' => $input['value'],
                'finance_document_id' => $document?->id,
                'source_url' => $document === null ? $input['source_url'] : null,
                'entry_method' => FinanceEntryMethod::Manual,
                'status' => FinanceFigureStatus::Pending,
                'entered_by' => $user->id,
            ]);
            ActivityLog::record('finance_figure_entered', $user->id);

            return $figure;
        });
    }
}
