<?php

namespace App\Contexts\Scheduling\Database\Factories;

use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<StudySessionOccurrence>
 */
class StudySessionOccurrenceFactory extends Factory
{
    protected $model = StudySessionOccurrence::class;

    public function definition(): array
    {
        $start = Carbon::now()->addDays(2)->setHour(9)->setMinute(0);

        return [
            'study_session_id' => StudySession::factory(),
            'starts_at' => $start,
            'ends_at' => (clone $start)->addHour(),
            'status' => 'scheduled',
        ];
    }
}
