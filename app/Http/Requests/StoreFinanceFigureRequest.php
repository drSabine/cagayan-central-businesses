<?php

namespace App\Http\Requests;

use App\Enums\FinanceBasis;
use App\Queries\FinanceReportQuery;
use Illuminate\Validation\Rule;

final class StoreFinanceFigureRequest extends FinanceReportRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $years = 'between:'.config('cagayan.finances.first_year').','.config('cagayan.finances.last_year');

        return [
            ...parent::rules(),
            'line_code' => ['required', 'string', Rule::exists('finance_lines', 'code')->where('displayed', true)],
            'fiscal_year' => ['required', 'integer', $years],
            'basis' => ['required', Rule::enum(FinanceBasis::class)],
            'value' => ['required', 'string', 'regex:/^-?\d{1,12}(\.\d{1,2})?$/'],
            'document_kind' => ['nullable', Rule::in(array_keys(FinanceReportQuery::KINDS)),
                Rule::exists('finance_documents', 'kind')->where('municipality_id', $this->town()->id)
                    ->where('fiscal_year', $this->reportYear())->where('availability', 'available')],
            'source_url' => ['nullable', 'required_without:document_kind', 'string', 'max:500', 'url:https'],
            'note' => ['required', 'string', 'max:'.config('cagayan.finances.note_max'), 'not_regex:/[\p{Cc}\p{Cf}<>]/u'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'value.regex' => 'Enter pesos as digits with up to two decimals, without commas.',
            'document_kind.exists' => 'That report is not on file for this town and year.',
            'source_url.required_without' => 'Choose the report you read, or give its COA link.',
            'note.not_regex' => 'Use plain text without markup or control characters.',
        ];
    }

    /**
     * @return array{line_code: string, fiscal_year: int, basis: string, value: string, document_kind: string|null, source_url: string|null, note: string}
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
            'note' => $this->string('note')->toString(),
        ];
    }
}
