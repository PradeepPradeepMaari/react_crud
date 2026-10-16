<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        static $counter = 0;
        $counter++;

        return [
            'employee_id'             => 'EMP-' . str_pad($counter, 4, '0', STR_PAD_LEFT),
            'firstname'               => fake()->firstName(),
            'lastname'                => fake()->lastName(),
            'date_of_birth'           => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'education_qualification' => fake()->randomElement([
                "Bachelor's Degree",
                "Master's Degree",
                'Diploma',
                'High School',
                'PhD',
            ]),
            'address'                 => fake()->address(),
            'email'                   => fake()->unique()->safeEmail(),
            'phone'                   => fake()->numerify('+94##########'),
            'photo'                   => null,
            'resume'                  => null,
        ];
    }
}
