<?php

namespace App\Http\Requests;

use App\Queries\AnalyticsCatalogQuery;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Selections shared by the public Economy page and the Capitol Analytics page. They only choose among
 * already loaded datasets, so the browser changes them locally after this first validated visit.
 */
class AnalyticsFiltersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'town' => ['nullable', 'string', Rule::anyOf([
                ['in:'.AnalyticsCatalogQuery::ALL_TOWNS],
                [Rule::exists('municipalities', 'psgc_code')],
            ])],
            'period' => ['nullable', Rule::in(['all', 'recent'])],
            'measure' => ['nullable', Rule::in(array_keys(config('cagayan.finances.groups')))],
            'dimension' => ['nullable', Rule::in(['industry', 'tag'])],
            'group' => ['nullable', 'string', 'max:90', 'regex:/^(industry|tag):[a-z0-9-]+$/i'],
        ];
    }

    /**
     * @return array{town: string, period: string, measure: string, dimension: string, group: string|null}
     */
    public function analyticsFilters(): array
    {
        return [
            'town' => $this->input('town') ?: (string) config('cagayan.performance.demo_town'),
            'period' => $this->input('period') ?: 'all',
            'measure' => $this->input('measure') ?: 'totals',
            'dimension' => $this->input('dimension') ?: 'industry',
            'group' => $this->input('group') ?: null,
        ];
    }
}
