<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\IdentifiesWishSubmitter;
use App\Models\BusinessType;
use App\Models\Municipality;
use App\Services\FormTimer;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWishRequest extends FormRequest
{
    use IdentifiesWishSubmitter;

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
            'town' => ['required', 'string', 'max:10', 'exists:municipalities,psgc_code'],
            'type' => ['required', 'string', 'max:64', 'exists:business_types,code'],
            'reason' => [
                'nullable',
                'string',
                'max:'.config('cagayan.wishes.reason_max'),
                // Links are the usual payload of form spam, and a reason never needs one.
                'not_regex:/(https?:\/\/|www\.|\.(com|net|org|ph|xyz|ru)\b)/i',
            ],
            // Hidden from people, so only bots fill it in.
            'website' => ['prohibited'],
            'form_token' => [
                'required',
                'string',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! is_string($value) || ! app(FormTimer::class)->isHumanPace($value)) {
                        $fail(__('The form expired or was sent too quickly. Reload the page and try again.'));
                    }
                },
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'town.required' => __('Choose a town.'),
            'town.exists' => __('Choose a town from the list.'),
            'type.required' => __('Choose a business type.'),
            'type.exists' => __('Choose a business type from the list.'),
            'reason.max' => __('Keep the reason under :max characters.'),
            'reason.not_regex' => __('Remove links and web addresses from the reason.'),
            'website.prohibited' => __('Leave the hidden field empty.'),
            'form_token.required' => __('The form expired or was sent too quickly. Reload the page and try again.'),
        ];
    }

    /**
     * Plain text only: tags and control characters are removed and spaces collapsed
     * before the length and link rules run.
     */
    protected function prepareForValidation(): void
    {
        if (! is_string($this->input('reason'))) {
            return;
        }

        $reason = strip_tags($this->input('reason'));
        $reason = (string) preg_replace('/(?!\n)\p{C}/u', '', $reason);
        $reason = (string) preg_replace('/[^\S\n]+/u', ' ', $reason);
        $reason = (string) preg_replace('/\n{3,}/', "\n\n", $reason);

        $this->merge(['reason' => trim($reason)]);
    }

    public function town(): Municipality
    {
        return Municipality::query()->where('psgc_code', $this->string('town')->toString())->firstOrFail();
    }

    public function type(): BusinessType
    {
        return BusinessType::query()->where('code', $this->string('type')->toString())->firstOrFail();
    }

    public function reason(): ?string
    {
        $reason = $this->string('reason')->toString();

        return $reason === '' ? null : $reason;
    }
}
