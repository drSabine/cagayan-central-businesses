<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class EconomicPerformanceRequest extends AnalyticsFiltersRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [...parent::rules(), 'wishView' => ['nullable', Rule::in(['cloud', 'bars'])]];
    }

    /**
     * @return array{town: string, period: string, measure: string, dimension: string, group: string|null, wishView: string}
     */
    public function filters(): array
    {
        return [...$this->analyticsFilters(), 'wishView' => $this->input('wishView') ?: 'cloud'];
    }
}
