<?php

namespace App\Http\Requests;

use App\Enums\FinanceBasis;
use App\Models\FinanceLine;
use App\Queries\FinanceReportQuery;
use App\Rules\OfficialCoaUrl;
use Illuminate\Validation\Rule;

final class StoreFinanceFigureRequest extends FinanceReportRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $years = 'between:'.config('cagayan.finances.first_year').','.min($this->reportYear(), (int) config('cagayan.finances.last_year'));
        $line = $this->input('line_code');
        $group = is_string($line) ? FinanceLine::query()->where('code', $line)->where('displayed', true)->value('group') : null;
        $bases = is_string($group) ? config("cagayan.finances.groups.{$group}.bases", ['actual']) : [];
        $digits = strlen(explode('.', (string) config('cagayan.finances.value_max'))[0]);

        return [
            ...parent::rules(),
            'line_code' => ['required', 'string', 'max:80', Rule::exists('finance_lines', 'code')->where('displayed', true)],
            'fiscal_year' => ['required', 'integer', $years],
            'basis' => ['required', Rule::enum(FinanceBasis::class), Rule::in($bases)],
            'value' => ['required', 'string', 'regex:/^\d{1,'.$digits.'}(\.\d{1,2})?$/', 'numeric', 'between:0,'.config('cagayan.finances.value_max')],
            'document_kind' => ['nullable', Rule::in(array_keys(FinanceReportQuery::KINDS)),
                Rule::exists('finance_documents', 'kind')->where('municipality_id', $this->town()->id)
                    ->where('fiscal_year', $this->reportYear())->where('availability', 'available')],
            'source_url' => ['nullable', 'required_without:document_kind', 'string', 'max:'.config('cagayan.finances.source_url_max'), 'url:https', new OfficialCoaUrl],
            'note' => ['prohibited'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'value.regex' => 'Enter pesos as digits with up to two decimals, without commas.',
            'document_kind.exists' => 'That report is not on file for this town and year.',
            'source_url.required_without' => 'Choose the report you read, or give its COA link.',
            'note.prohibited' => 'A note is not part of figure entry.',
            'basis.in' => 'Choose an allowed basis for this financial line.',
            'fiscal_year.between' => 'Choose a fiscal year within the supported range and no later than the report.',
        ];
    }

    /**
     * @return array{line_code: string, fiscal_year: int, basis: string, value: string, document_kind: string|null, source_url: string|null}
     */
    public function figure(): array
    {
        return [
            'line_code' => $this->string('line_code')->toString(),
            'fiscal_year' => $this->integer('fiscal_year'),
            'basis' => $this->string('basis')->toString(),
            'value' => $this->string('value')->toString(),
            'document_kind' => $this->filled('document_kind') ? $this->string('document_kind')->toString() : null,
            'source_url' => $this->filled('source_url') ? $this->string('source_url')->toString() : null,
        ];
    }
}
