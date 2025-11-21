<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class UpdateStudySessionOccurrenceAction
{
    public function __construct(private readonly ScheduleStudySessionRemindersAction $scheduleStudySessionRemindersAction)
    {
    }

    /**
     * @param array<string, mixed> $attributes
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(
        StudySession $session,
        StudySessionOccurrence $occurrence,
        array $attributes,
        User $teacher
    ): StudySessionOccurrence {
        $this->authorize($session, $occurrence, $teacher);

        $startsAt = $attributes['starts_at'] ?? $occurrence->starts_at;
        $endsAt = $attributes['ends_at'] ?? $occurrence->ends_at;

        if ($startsAt instanceof Carbon === false) {
            $startsAt = Carbon::parse($startsAt);
        }

        if ($endsAt instanceof Carbon === false) {
            $endsAt = Carbon::parse($endsAt);
        }

        if ($startsAt->greaterThanOrEqualTo($endsAt)) {
            throw ValidationException::withMessages([
                'ends_at' => 'The end time must be after the start time.',
            ]);
        }

        $occurrence->fill([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => $attributes['status'] ?? $occurrence->status ?? StudySessionStatus::SCHEDULED,
        ])->save();

        $updated = $occurrence->refresh();
        $this->scheduleStudySessionRemindersAction->execute($session->load('occurrences'));

        return $updated;
    }

    /**
     * @throws AuthorizationException
     */
    private function authorize(StudySession $session, StudySessionOccurrence $occurrence, User $teacher): void
    {
        if ($teacher->role !== 'teacher' && $teacher->role !== 'admin') {
            throw new AuthorizationException('Only teachers or admins can update occurrences.');
        }

        if ($teacher->role === 'teacher' && (int) $session->teacher_id !== (int) $teacher->getKey()) {
            throw new AuthorizationException('You may only update your own study sessions.');
        }

        if ((int) $occurrence->study_session_id !== (int) $session->getKey()) {
            throw new AuthorizationException('Occurrence does not belong to this study session.');
        }
    }
}
