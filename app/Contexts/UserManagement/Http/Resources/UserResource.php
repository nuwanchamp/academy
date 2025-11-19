<?php

namespace App\Contexts\UserManagement\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Contexts\UserManagement\Models\User */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'preferred_locale' => $this->preferred_locale,
            'timezone' => $this->timezone,
            'is_active' => (bool) $this->is_active,
            'last_login_at' => $this->last_login_at,
        ];
    }
}

