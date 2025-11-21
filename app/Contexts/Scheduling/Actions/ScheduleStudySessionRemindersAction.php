<?php

namespace App\Contexts\Scheduling\Actions;

use App\Contexts\Scheduling\Jobs\SendStudySessionReminder;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use App\Contexts\Scheduling\Enums\StudySessionStatus;
use Illuminate\Support\Carbon;

class ScheduleStudySessionRemindersAction
{
    public function execute(StudySession $session): void
    {
        foreach ($session->occurrences as $occurrence) {
            $this->dispatchReminder($session, $occurrence, 24);
            $this->dispatchReminder($session, $occurrence, 1);
        }
    }

    private function dispatchReminder(StudySession $session, StudySessionOccurrence $occurrence, int $hoursBefore): void
    {
        $status = $occurrence->status instanceof StudySessionStatus ? $occurrence->status->value : $occurrence->status;

        if ($status === StudySessionStatus::CANCELLED->value) {
            return;
        }

        $sendAt = $occurrence->starts_at->copy()->subHours($hoursBefore);

        if ($sendAt->lessThan(Carbon::now())) {
            return;
        }

        SendStudySessionReminder::dispatch($session, $occurrence)->delay($sendAt);
    }
}
