<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Models\ModuleLesson;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ModuleLesson */
class ModuleLessonResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sequence_order' => $this->sequence_order,
            'title' => $this->title,
            'summary' => $this->summary,
            'objectives' => $this->objectives ?? [],
            'body' => $this->body,
            'instructions' => $this->instructions,
            'outcomes' => $this->outcomes ?? [],
            'materials' => $this->whenLoaded('materials', function () {
                return $this->materials->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'name' => $material->name,
                        'file_type' => $material->file_type,
                        'file_size_bytes' => $material->file_size_bytes,
                        'storage_path' => $material->storage_path,
                        'external_url' => $material->external_url,
                        'meta' => $material->meta ?? [],
                    ];
                });
            }),
            'media_uploads' => $this->whenLoaded('mediaUploads', function () {
                return $this->mediaUploads->map(function ($upload) {
                    return [
                        'id' => $upload->id,
                        'file_name' => $upload->file_name,
                        'storage_path' => $upload->storage_path,
                        'mime_type' => $upload->mime_type,
                        'file_size_bytes' => $upload->file_size_bytes,
                        'meta' => $upload->meta ?? [],
                    ];
                });
            }),
        ];
    }
}
