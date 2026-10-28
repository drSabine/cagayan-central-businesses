<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class BusinessCategoriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-categories') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['tag' => ['nullable', 'string', Rule::exists('focus_tags', 'code')]];
    }
}
