<?php

namespace App\Contexts\Scheduling\Http\Resources;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudySessionEnrollment */
class StudySessionEnrollmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'study_session_id' => $this->study_session_id,
            'student_id' => $this->student_id,
            'status' => $this->status instanceof EnrollmentStatus ? $this->status->value : $this->status,
            'waitlist_position' => $this->waitlist_position,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
