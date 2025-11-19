<?php

namespace App\Contexts\StudentProfiles\Http\Resources;

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\StudentProfiles\Models\Student;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Student */
class StudentResource extends JsonResource
{

    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'preferred_name' => $this->preferred_name,
            'date_of_birth' => optional($this->date_of_birth)?->toDateString(),
            'grade' => $this->grade,
            'status' => $this->status instanceof StudentStatus ? $this->status->value : $this->status,
            'diagnoses' => $this->diagnoses ?? [],
            'notes' => $this->notes,
            'assessment_summary' => $this->assessment_summary,
            'ieps_or_goals' => $this->ieps_or_goals ?? [],
            'risk_flags' => $this->risk_flags ?? [],
            'teacher_id' => $this->teacher_id,
            'case_manager_id' => $this->case_manager_id,
            'current_learning_path_id' => $this->current_learning_path_id,
            'start_date' => optional($this->start_date)?->toDateString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'guardians' => $this->whenLoaded('guardians', function () {
                return $this->guardians->map(function ($guardian) {
                    $profile = $guardian->guardianProfile;

                    return [
                        'id' => $guardian->id,
                        'name' => $guardian->name,
                        'email' => $guardian->email,
                        'pivot' => [
                            'relationship' => $guardian->pivot->relationship,
                            'is_primary' => (bool) $guardian->pivot->is_primary,
                            'access_level' => $guardian->pivot->access_level,
                            'notifications_opt_in' => (bool) $guardian->pivot->notifications_opt_in,
                        ],
                        'profile' => [
                            'primary_phone' => $profile?->primary_phone,
                            'address_line1' => $profile?->address_line1,
                        ],
                    ];
                });
            }),
        ];
    }
}
