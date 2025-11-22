<?php

namespace App\Contexts\LearningPaths\Http\Resources;

use App\Contexts\LearningPaths\Models\Module;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Module */
class PathModuleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'sequence_order' => $this->pivot?->sequence_order,
        ];
    }
}
