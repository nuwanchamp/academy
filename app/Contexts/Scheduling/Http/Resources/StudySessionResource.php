<?php

namespace App\Contexts\Scheduling\Http\Resources;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Http\Resources\StudySessionOccurrenceResource;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudySession */
class StudySessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $enrolledCount = $this->enrolled_count
            ?? $this->enrollments?->where('status', EnrollmentStatus::ENROLLED)->count()
            ?? 0;

        $waitlistCount = $this->waitlist_count
            ?? $this->enrollments?->where('status', EnrollmentStatus::WAITLISTED)->count()
            ?? 0;

        return [
            'id' => $this->id,
            'teacher_id' => $this->teacher_id,
            'title' => $this->title,
            'description' => $this->description,
            'starts_at' => $this->starts_at?->toDateTimeString(),
            'ends_at' => $this->ends_at?->toDateTimeString(),
            'location' => $this->location,
            'meeting_url' => $this->meeting_url,
            'capacity' => $this->capacity,
            'timezone' => $this->timezone,
            'status' => $this->status instanceof StudySessionStatus ? $this->status->value : $this->status,
            'enrolled_count' => $enrolledCount,
            'waitlist_count' => $waitlistCount,
            'occurrences' => $this->whenLoaded('occurrences', fn () => StudySessionOccurrenceResource::collection($this->occurrences)),
        ];
    }
}
