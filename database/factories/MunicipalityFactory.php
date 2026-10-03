<?php

namespace Database\Factories;

use App\Enums\MunicipalityKind;
use App\Models\Municipality;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Municipality>
 */
class MunicipalityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'psgc_code' => '02015'.fake()->unique()->numerify('##').'000',
            'name' => fake()->unique()->city(),
            'kind' => MunicipalityKind::Municipality,
            'is_connected' => false,
        ];
    }

    public function connected(): static
    {
        return $this->state(fn () => ['is_connected' => true]);
    }
}
