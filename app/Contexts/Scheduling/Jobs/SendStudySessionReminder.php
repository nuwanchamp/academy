<?php

namespace App\Contexts\Scheduling\Jobs;

use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use App\Contexts\Scheduling\Notifications\StudySessionReminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendStudySessionReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly StudySession $session,
        public readonly StudySessionOccurrence $occurrence
    ) {
    }

    public function handle(): void
    {
        $teacher = $this->session->teacher;
        if ($teacher) {
            Notification::send($teacher, new StudySessionReminder($this->session, $this->occurrence));
        }

        $guardianIds = $this->session->enrollments()
            ->with('student.guardians')
            ->get()
            ->pluck('student.guardians')
            ->flatten()
            ->filter(fn ($guardian) => (bool) $guardian?->pivot?->notifications_opt_in)
            ->unique('id');

        Notification::send($guardianIds, new StudySessionReminder($this->session, $this->occurrence));
    }
}
