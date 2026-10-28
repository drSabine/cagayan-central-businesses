<?php

namespace Database\Factories;

use App\Models\FocusTag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FocusTag>
 */
class FocusTagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = ucfirst(fake()->unique()->word());

        return [
            'code' => strtolower($name),
            'name' => $name,
            'sort_order' => fake()->numberBetween(1, 50),
        ];
    }
}
