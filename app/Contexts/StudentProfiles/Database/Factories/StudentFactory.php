<?php

namespace App\Contexts\StudentProfiles\Database\Factories;

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'preferred_name' => $this->faker->optional()->firstName(),
            'date_of_birth' => $this->faker->dateTimeBetween('-12 years', '-5 years'),
            'grade' => 'Grade '. $this->faker->numberBetween(1, 8),
            'status' => $this->faker->randomElement(StudentStatus::values()),
            'diagnoses' => $this->faker->randomElements(
                ['SPD', 'ADHD', 'Autism'],
                $this->faker->numberBetween(0, 2)
            ),
            'notes' => $this->faker->sentence(),
            'assessment_summary' => $this->faker->paragraph(),
            'ieps_or_goals' => ['Develop coping skills'],
            'risk_flags' => $this->faker->randomElements([
                'transition_support',
                'communication',
                'attendance',
            ], $this->faker->numberBetween(0, 2)),
            'teacher_id' => null,
            'case_manager_id' => User::factory(),
            'current_learning_path_id' => null,
            'start_date' => $this->faker->date(),
            'created_by' => null,
            'updated_by' => null,
        ];
    }
}
