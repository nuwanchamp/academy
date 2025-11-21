<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use App\Contexts\Scheduling\Notifications\EnrollmentCancelled;
use App\Contexts\Scheduling\Notifications\WaitlistPromoted;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class CancelEnrollmentAction
{
    /**
     * @throws AuthorizationException
     */
    public function execute(StudySessionEnrollment $enrollment, User $teacher): void
    {
        $session = $enrollment->session;

        if ((int) $session->teacher_id !== (int) $teacher->getKey()) {
            throw new AuthorizationException('You may only cancel enrollments for your sessions.');
        }

        DB::transaction(function () use ($enrollment, $session): void {
            $enrollment->delete();
            $this->promoteWaitlist($session);
        });

        Notification::send($teacher, new EnrollmentCancelled($session));
    }

    private function promoteWaitlist(StudySession $session): void
    {
        $next = $session->enrollments()
            ->where('status', EnrollmentStatus::WAITLISTED)
            ->orderBy('waitlist_position')
            ->first();

        if ($next === null) {
            return;
        }

        $next->loadMissing('student.guardians');

        $next->fill([
            'status' => EnrollmentStatus::ENROLLED,
            'waitlist_position' => null,
        ])->save();

        $guardians = $next->student?->guardians?->filter(fn ($guardian) => (bool) $guardian->pivot?->notifications_opt_in) ?? collect();
        Notification::send($guardians, new WaitlistPromoted($session));

        $this->resequenceWaitlist($session);
    }

    private function resequenceWaitlist(StudySession $session): void
    {
        $position = 1;
        $session->enrollments()
            ->where('status', EnrollmentStatus::WAITLISTED)
            ->orderBy('waitlist_position')
            ->each(function (StudySessionEnrollment $enrollment) use (&$position): void {
                $enrollment->update(['waitlist_position' => $position]);
                $position++;
            });
    }
}
