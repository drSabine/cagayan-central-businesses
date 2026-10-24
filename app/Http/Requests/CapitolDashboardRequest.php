<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

final class CapitolDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('capitol') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'town' => ['nullable', 'string', 'regex:/^\d{10}$/', Rule::exists('municipalities', 'psgc_code')],
            'level' => ['nullable', Rule::in(['towns', 'barangays']), 'required_with:barangay'],
            'barangay' => ['nullable', 'string', 'regex:/^\d{10}$/'],
        ];
    }

    /** @return list<\Closure> */
    public function after(): array
    {
        return [function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            if ($this->input('level') === 'barangays' && ! $this->filled('town')) {
                $validator->errors()->add('town', 'Choose a town before viewing barangays.');
            }
            if ($this->filled('barangay')) {
                $path = base_path('data/barangays/maps/'.$this->string('town').'.json');
                /** @var array{features?: list<array{properties: array{psgc_code: string}}> } $data */
                $data = is_file($path) ? json_decode(File::get($path), true) : [];
                if (! collect($data['features'] ?? [])->contains(fn ($f) => $f['properties']['psgc_code'] === $this->input('barangay'))) {
                    $validator->errors()->add('barangay', 'Choose a barangay in the selected town.');
                }
            }
        }];
    }
}
