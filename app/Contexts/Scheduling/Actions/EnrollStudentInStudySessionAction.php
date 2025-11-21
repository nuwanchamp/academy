<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EnrollStudentInStudySessionAction
{
    /**
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(StudySession $session, Student $student, User $teacher): StudySessionEnrollment
    {
        $this->authorize($session, $student, $teacher);

        return DB::transaction(function () use ($session, $student) {
            /** @var StudySession $lockedSession */
            $lockedSession = StudySession::lockForUpdate()->findOrFail($session->getKey());

            if ($lockedSession->enrollments()->where('student_id', $student->getKey())->exists()) {
                throw ValidationException::withMessages([
                    'student_id' => 'Student is already enrolled or waitlisted for this session.',
                ]);
            }

            $enrolledCount = $lockedSession->enrollments()
                ->where('status', EnrollmentStatus::ENROLLED)
                ->count();

            $status = $enrolledCount < $lockedSession->capacity
                ? EnrollmentStatus::ENROLLED
                : EnrollmentStatus::WAITLISTED;

            $waitlistPosition = null;
            if ($status === EnrollmentStatus::WAITLISTED) {
                $nextPosition = $lockedSession->enrollments()
                    ->where('status', EnrollmentStatus::WAITLISTED)
                    ->max('waitlist_position') ?? 0;
                $waitlistPosition = $nextPosition + 1;
            }

            return $lockedSession->enrollments()->create([
                'student_id' => $student->getKey(),
                'status' => $status,
                'waitlist_position' => $waitlistPosition,
            ]);
        });
    }

    /**
     * @throws AuthorizationException
     */
    private function authorize(StudySession $session, Student $student, User $teacher): void
    {
        if ($teacher->role !== 'teacher') {
            throw new AuthorizationException('Only teachers can enroll students.');
        }

        if ((int) $session->teacher_id !== (int) $teacher->getKey()) {
            throw new AuthorizationException('You can only enroll students into your own study sessions.');
        }

        $teacherId = (int) $teacher->getKey();
        $isInCaseload = (int) $student->teacher_id === $teacherId || (int) $student->case_manager_id === $teacherId;

        if (!$isInCaseload) {
            throw new AuthorizationException('Student must be in your caseload.');
        }
    }
}
