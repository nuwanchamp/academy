<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\Scheduling\Actions\ScheduleStudySessionRemindersAction;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Support\RecurrenceGenerator;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use App\Contexts\Scheduling\Notifications\StudySessionCreated;

class CreateStudySessionAction
{
    public function __construct(
        private readonly RecurrenceGenerator $recurrenceGenerator,
        private readonly ScheduleStudySessionRemindersAction $scheduleStudySessionRemindersAction
    )
    {
    }

    /**
     * @param array<string, mixed> $attributes
     * @throws ValidationException
     * @throws AuthorizationException
     */
    public function execute(array $attributes, User $teacher): StudySession
    {
        if ($teacher->role !== 'teacher' && $teacher->role !== 'admin') {
            throw new AuthorizationException('Only teachers or admins can create study sessions.');
        }

        $startsAt = Carbon::parse($attributes['starts_at']);
        $endsAt = Carbon::parse($attributes['ends_at']);

        if ($startsAt->greaterThanOrEqualTo($endsAt)) {
            throw ValidationException::withMessages([
                'ends_at' => 'The end time must be after the start time.',
            ]);
        }

        if ($this->hasConflict($teacher, $startsAt, $endsAt)) {
            throw ValidationException::withMessages([
                'starts_at' => 'You already have a study session during this time.',
            ]);
        }

        $timezone = $attributes['timezone'] ?? $teacher->timezone ?? 'UTC';
        $recurrence = $attributes['recurrence'] ?? null;
        $frequency = $recurrence['frequency'] ?? null;
        $count = (int) ($recurrence['count'] ?? 1);

        $studySession = StudySession::create([
            'teacher_id' => $teacher->getKey(),
            'title' => $attributes['title'],
            'description' => $attributes['description'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'location' => $attributes['location'] ?? null,
            'meeting_url' => $attributes['meeting_url'] ?? null,
            'capacity' => $attributes['capacity'] ?? 1,
            'timezone' => $timezone,
            'status' => StudySessionStatus::SCHEDULED,
            'recurrence_rule' => $this->recurrenceGenerator->toRule($frequency, $count),
        ]);

        $this->createOccurrences($studySession, $startsAt, $endsAt, $frequency, $count);

        $studySession->load('occurrences');
        $this->scheduleStudySessionRemindersAction->execute($studySession);

        Notification::send($teacher, new StudySessionCreated($studySession));

        return $studySession;
    }

    private function hasConflict(User $teacher, Carbon $startsAt, Carbon $endsAt): bool
    {
        return StudySession::query()
            ->where('teacher_id', $teacher->getKey())
            ->where('status', StudySessionStatus::SCHEDULED)
            ->where(function ($query) use ($startsAt, $endsAt) {
                $query->whereBetween('starts_at', [$startsAt, $endsAt])
                    ->orWhereBetween('ends_at', [$startsAt, $endsAt])
                    ->orWhere(function ($subQuery) use ($startsAt, $endsAt) {
                        $subQuery->where('starts_at', '<=', $startsAt)
                            ->where('ends_at', '>=', $endsAt);
                    });
            })
            ->exists();
    }

    private function createOccurrences(StudySession $session, Carbon $startsAt, Carbon $endsAt, ?string $frequency, int $count): void
    {
        $occurrences = $this->recurrenceGenerator->generate($startsAt, $endsAt, $frequency, $count);

        $session->occurrences()->createMany(array_map(
            fn (array $time) => [
                'starts_at' => $time['starts_at'],
                'ends_at' => $time['ends_at'],
            ],
            $occurrences
        ));
    }
}
