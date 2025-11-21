<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\Scheduling\Actions\ScheduleStudySessionRemindersAction;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Support\RecurrenceGenerator;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use App\Contexts\Scheduling\Notifications\StudySessionUpdated;

class UpdateStudySessionAction
{
    public function __construct(
        private readonly RecurrenceGenerator $recurrenceGenerator,
        private readonly ScheduleStudySessionRemindersAction $scheduleStudySessionRemindersAction
    )
    {
    }

    /**
     * @param array<string, mixed> $attributes
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(StudySession $session, array $attributes, User $teacher): StudySession
    {
        $this->authorize($session, $teacher);

        $startsAt = isset($attributes['starts_at']) ? Carbon::parse($attributes['starts_at']) : $session->starts_at;
        $endsAt = isset($attributes['ends_at']) ? Carbon::parse($attributes['ends_at']) : $session->ends_at;

        if ($startsAt->greaterThanOrEqualTo($endsAt)) {
            throw ValidationException::withMessages([
                'ends_at' => 'The end time must be after the start time.',
            ]);
        }

        $status = $attributes['status'] ?? $session->status;
        $recurrence = $attributes['recurrence'] ?? $this->recurrenceGenerator->fromRule($session->recurrence_rule);
        $frequency = $recurrence['frequency'] ?? null;
        $count = (int) ($recurrence['count'] ?? 1);

        $this->assertNoConflict($session, $teacher, $startsAt, $endsAt);

        $updated = DB::transaction(function () use ($session, $startsAt, $endsAt, $status, $frequency, $count, $attributes) {
            $statusValue = $status instanceof StudySessionStatus ? $status->value : $status;

            $session->forceFill([
                'title' => $attributes['title'] ?? $session->title,
                'description' => $attributes['description'] ?? $session->description,
                'location' => $attributes['location'] ?? $session->location,
                'meeting_url' => $attributes['meeting_url'] ?? $session->meeting_url,
                'capacity' => $attributes['capacity'] ?? $session->capacity,
                'timezone' => $attributes['timezone'] ?? $session->timezone,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => $statusValue,
                'recurrence_rule' => $this->recurrenceGenerator->toRule($frequency, $count),
            ])->save();

            $session->occurrences()->delete();
            $this->materializeOccurrences($session, $startsAt, $endsAt, $frequency, $count, $statusValue);

            if ($statusValue === StudySessionStatus::CANCELLED->value) {
                $session->occurrences()->update(['status' => StudySessionStatus::CANCELLED]);
            }

            return $session->load('occurrences');
        });

        Notification::send($teacher, new StudySessionUpdated($updated));
        $this->scheduleStudySessionRemindersAction->execute($updated);

        return $updated;
    }

    /**
     * @throws AuthorizationException
     */
    private function authorize(StudySession $session, User $teacher): void
    {
        if ($teacher->role !== 'teacher' && $teacher->role !== 'admin') {
            throw new AuthorizationException('Only teachers or admins can update study sessions.');
        }

        if ($teacher->role === 'teacher' && (int) $session->teacher_id !== (int) $teacher->getKey()) {
            throw new AuthorizationException('You may only update your own study sessions.');
        }
    }

    /**
     * @throws ValidationException
     */
    private function assertNoConflict(StudySession $session, User $teacher, Carbon $startsAt, Carbon $endsAt): void
    {
        $conflict = StudySession::query()
            ->where('teacher_id', $teacher->getKey())
            ->where('id', '!=', $session->getKey())
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

        if ($conflict) {
            throw ValidationException::withMessages([
                'starts_at' => 'You already have a study session during this time.',
            ]);
        }
    }

    private function materializeOccurrences(
        StudySession $session,
        Carbon $startsAt,
        Carbon $endsAt,
        ?string $frequency,
        int $count,
        string|StudySessionStatus $status
    ): void {
        $occurrences = $this->recurrenceGenerator->generate($startsAt, $endsAt, $frequency, $count);
        $session->occurrences()->createMany(array_map(
            fn (array $time) => [
                'starts_at' => $time['starts_at'],
                'ends_at' => $time['ends_at'],
                'status' => $status,
            ],
            $occurrences
        ));
    }
}
