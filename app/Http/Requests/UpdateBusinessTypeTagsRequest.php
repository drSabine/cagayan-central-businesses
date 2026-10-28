<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBusinessTypeTagsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-categories') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'tags' => ['present', 'array', 'max:50'],
            'tags.*' => ['string', 'distinct', 'exists:focus_tags,code'],
        ];
    }

    /** @return list<string> */
    public function tagCodes(): array
    {
        return array_values(array_map('strval', (array) $this->input('tags', [])));
    }
}
