<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class EconomicPerformanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'town' => ['nullable', 'string', Rule::exists('municipalities', 'psgc_code')],
            'period' => ['nullable', Rule::in(['all', 'recent'])],
            'wishView' => ['nullable', Rule::in(['cloud', 'bars'])],
        ];
    }

    /** @return array{town: string, period: string, wishView: string} */
    public function filters(): array
    {
        return [
            'town' => $this->input('town') ?: (string) config('cagayan.performance.demo_town'),
            'period' => $this->input('period') ?: 'all',
            'wishView' => $this->input('wishView') ?: 'cloud',
        ];
    }
}
