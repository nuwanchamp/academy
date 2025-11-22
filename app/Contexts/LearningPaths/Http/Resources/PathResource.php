<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use App\Contexts\LearningPaths\Models\Path;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Path */
class PathResource extends JsonResource
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
            'objectives' => $this->objectives ?? [],
            'success_metrics' => $this->success_metrics ?? [],
            'planned_release_date' => optional($this->planned_release_date)?->toDateString(),
            'published_at' => optional($this->published_at)?->toDateTimeString(),
            'archived_at' => optional($this->archived_at)?->toDateTimeString(),
            'owner' => $this->whenLoaded('owner', function () {
                return [
                    'id' => $this->owner->id,
                    'name' => $this->owner->name,
                    'email' => $this->owner->email,
                ];
            }),
            'modules' => $this->whenLoaded('modules', function () {
                return PathModuleResource::collection($this->modules);
            }),
        ];
    }
}
