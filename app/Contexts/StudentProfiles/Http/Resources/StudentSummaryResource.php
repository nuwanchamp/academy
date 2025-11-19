<?php

namespace App\Contexts\StudentProfiles\Http\Resources;

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\StudentProfiles\Models\Student;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Student */
class StudentSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $preferredName = $this->preferred_name ?? null;
        $fullName = trim(sprintf('%s %s', $this->first_name, $this->last_name));

        $status = $this->status;

        return [
            'id' => $this->id,
            'name' => $preferredName ?: $fullName,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'preferred_name' => $preferredName,
            'date_of_birth' => optional($this->date_of_birth)?->toDateString(),
            'grade' => $this->grade,
            'status' => $status instanceof StudentStatus ? $status->value : $status,
        ];
    }
}
