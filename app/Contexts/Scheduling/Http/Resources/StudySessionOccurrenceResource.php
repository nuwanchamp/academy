<?php

namespace App\Contexts\Scheduling\Http\Resources;

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudySessionOccurrence */
class StudySessionOccurrenceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'study_session_id' => $this->study_session_id,
            'starts_at' => $this->starts_at?->toDateTimeString(),
            'ends_at' => $this->ends_at?->toDateTimeString(),
            'status' => $this->status instanceof StudySessionStatus ? $this->status->value : $this->status,
        ];
    }
}
