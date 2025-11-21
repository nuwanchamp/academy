<?php

namespace App\Contexts\Scheduling\Database\Factories;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use App\Contexts\StudentProfiles\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudySessionEnrollment>
 */
class StudySessionEnrollmentFactory extends Factory
{
    protected $model = StudySessionEnrollment::class;

    public function definition(): array
    {
        return [
            'study_session_id' => StudySession::factory(),
            'student_id' => Student::factory(),
            'status' => EnrollmentStatus::ENROLLED,
            'waitlist_position' => null,
        ];
    }

    public function waitlisted(): self
    {
        return $this->state(fn () => [
            'status' => EnrollmentStatus::WAITLISTED,
            'waitlist_position' => $this->faker->numberBetween(1, 3),
        ]);
    }
}
