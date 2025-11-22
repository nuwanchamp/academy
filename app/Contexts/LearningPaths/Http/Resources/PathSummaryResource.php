<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use App\Contexts\LearningPaths\Models\Path;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Path */
class PathSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'code' => $this->code,
            'title' => $this->title,
            'summary' => $this->summary,
            'subject' => $this->subject,
            'grade_band' => $this->grade_band,
            'status' => $this->status instanceof PathStatus ? $this->status->value : $this->status,
            'visibility' => $this->visibility instanceof PathVisibility ? $this->visibility->value : $this->visibility,
            'pacing' => $this->pacing,
            'modules_count' => $this->modules_count,
            'updated_at' => optional($this->updated_at)?->toDateTimeString(),
        ];
    }
}
