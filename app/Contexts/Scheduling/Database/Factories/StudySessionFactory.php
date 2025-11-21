<?php

namespace App\Contexts\Scheduling\Database\Factories;

use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<StudySession>
 */
class StudySessionFactory extends Factory
{
    protected $model = StudySession::class;

    public function definition(): array
    {
        $start = Carbon::now()->addDays(2)->setHour(10)->setMinute(0)->setSecond(0);

        return [
            'teacher_id' => User::factory(['role' => 'teacher']),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'starts_at' => $start,
            'ends_at' => (clone $start)->addHour(),
            'location' => 'Room '.$this->faker->numberBetween(1, 25),
            'meeting_url' => $this->faker->url(),
            'capacity' => $this->faker->numberBetween(1, 8),
            'timezone' => 'UTC',
        ];
    }
}
