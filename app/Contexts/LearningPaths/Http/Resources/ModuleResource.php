<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use App\Contexts\LearningPaths\Models\Module;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Module */
class ModuleResource extends JsonResource
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
            'objectives' => $this->objectives ?? [],
            'prerequisites' => $this->prerequisites ?? [],
            'progress_tracking' => $this->progress_tracking,
            'completion_criteria' => $this->completion_criteria,
            'feedback_strategy' => $this->feedback_strategy,
            'access_control' => $this->access_control,
            'published_at' => optional($this->published_at)?->toDateTimeString(),
            'archived_at' => optional($this->archived_at)?->toDateTimeString(),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'authors' => $this->whenLoaded('authors', function () {
                return $this->authors->map(function ($author) {
                    return [
                        'id' => $author->id,
                        'name' => $author->name,
                        'role' => $author->role,
                        'bio' => $author->bio,
                        'contact_links' => $author->contact_links ?? [],
                    ];
                });
            }),
            'lessons' => $this->whenLoaded('lessons', function () {
                return ModuleLessonResource::collection($this->lessons->sortBy('sequence_order')->values());
            }),
        ];
    }
}
