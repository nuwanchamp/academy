<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use App\Contexts\LearningPaths\Models\Module;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Module */
class ModuleSummaryResource extends JsonResource
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
            'status' => $this->status instanceof ModuleStatus ? $this->status->value : $this->status,
            'version_label' => $this->version_label,
            'difficulty' => $this->difficulty,
            'estimated_duration' => $this->estimated_duration,
            'learning_type' => $this->learning_type,
            'lessons_count' => $this->lessons_count,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'updated_at' => optional($this->updated_at)?->toDateTimeString(),
        ];
    }
}
