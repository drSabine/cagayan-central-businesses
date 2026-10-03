<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\IdentifiesWishSubmitter;
use App\Models\BusinessType;
use App\Models\Municipality;
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
            'town' => ['required', 'string', 'exists:municipalities,psgc_code'],
            'type' => ['required', 'string', 'exists:business_types,code'],
            'reason' => ['nullable', 'string', 'max:'.config('cagayan.wishes.reason_max')],
            // Hidden from people, so only bots fill it in.
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'town.required' => __('Pick a town.'),
            'town.exists' => __('Pick a town from the list.'),
            'type.required' => __('Pick a business type.'),
            'type.exists' => __('Pick a business type from the list.'),
            'reason.max' => __('Keep the reason under :max characters.'),
            'website.prohibited' => __('Leave the hidden field empty.'),
        ];
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
        $reason = trim($this->string('reason')->toString());

        return $reason === '' ? null : $reason;
    }
}
