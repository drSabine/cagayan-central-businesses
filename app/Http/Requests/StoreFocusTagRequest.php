<?php

namespace App\Http\Requests;

use App\Models\FocusTag;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

final class StoreFocusTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-categories') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'max:'.config('cagayan.inputs.focus_tag_name_max'), 'not_regex:/[\p{Cc}\p{Cf}<>]/u',
                // The code is the slug of the name, so two names that differ only in punctuation collide.
                function (string $attribute, mixed $value, Closure $fail): void {
                    $code = Str::slug((string) $value);
                    if ($code === '') {
                        $fail('Use letters or numbers in the name.');
                    } elseif (FocusTag::query()->where('code', $code)->exists()) {
                        $fail('A Focus Tag with this name already exists.');
                    }
                },
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['name.not_regex' => 'Use plain text without markup or control characters.'];
    }
}
