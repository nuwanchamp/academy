<?php

namespace App\Contexts\ParentPortal\Http\Resources;

use App\Contexts\ParentPortal\Models\GuardianProfile;
use App\Contexts\StudentProfiles\Http\Resources\StudentResource;
use App\Contexts\UserManagement\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GuardianProfile */
class ParentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'user' => new UserResource($this->user),
            'profile' => [
                'household_id' => $this->household_id,
                'primary_phone' => $this->primary_phone,
                'secondary_phone' => $this->secondary_phone,
                'address_line1' => $this->address_line1,
                'address_line2' => $this->address_line2,
                'city' => $this->city,
                'state' => $this->state,
                'postal_code' => $this->postal_code,
                'preferred_contact_times' => $this->preferred_contact_times,
                'communication_preferences' => $this->communication_preferences ?? [],
                'identity_verified_at' => $this->identity_verified_at?->toDateTimeString(),
            ],
            'students' => $this->whenLoaded('students', function () {
                return $this->students->map(function ($student) {
                    $data = (new StudentResource($student))->resolve();
                    $data['pivot'] = [
                        'relationship' => $student->pivot->relationship,
                        'is_primary' => (bool) $student->pivot->is_primary,
                        'access_level' => $student->pivot->access_level,
                        'notifications_opt_in' => (bool) $student->pivot->notifications_opt_in,
                    ];

                    return $data;
                });
            }, []),
        ];
    }
}
