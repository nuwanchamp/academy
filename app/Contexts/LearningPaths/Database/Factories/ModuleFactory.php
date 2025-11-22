<?php

namespace App\Contexts\LearningPaths\Database\Factories;

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use App\Contexts\LearningPaths\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Module>
 */
class ModuleFactory extends Factory
{
    protected $model = Module::class;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'code' => strtoupper('MOD-'.$this->faker->bothify('???-###')),
            'title' => $this->faker->sentence(3),
            'summary' => $this->faker->paragraph(),
            'subject' => $this->faker->randomElement(['Literacy', 'Science', 'Wellness', 'Mathematics']),
            'grade_band' => $this->faker->randomElement(['Grades K – 2', 'Grades 3 – 5', 'Grades 6 – 8']),
            'status' => $this->faker->randomElement(ModuleStatus::values()),
            'version_label' => 'v'.$this->faker->randomDigitNotNull().'.'.$this->faker->randomDigit(),
            'difficulty' => $this->faker->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'estimated_duration' => $this->faker->randomElement(['2 weeks', '3 weeks', '4 weeks']),
            'learning_type' => $this->faker->randomElement(['Hands-on', 'Project-based', 'Seminar']),
            'lessons_count' => $this->faker->numberBetween(1, 12),
            'objectives' => $this->faker->sentences(3),
            'prerequisites' => $this->faker->sentences(2),
            'progress_tracking' => $this->faker->sentence(),
            'completion_criteria' => $this->faker->sentence(),
            'feedback_strategy' => $this->faker->sentence(),
            'access_control' => 'teachers',
        ];
    }
}
