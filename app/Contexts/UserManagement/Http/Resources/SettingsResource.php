<?php

namespace App\Contexts\UserManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingsResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        /** @var \App\Contexts\UserManagement\Models\User $user */
        $user = $this->resource['user'];
        $settings = $this->resource['settings'];

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'timezone' => $user->timezone,
                'preferred_locale' => $user->preferred_locale,
                'phone' => $user->phone,
                'is_active' => (bool) $user->is_active,
            ],
            'settings' => [
                'notifications' => $settings->notifications,
                'login_alerts' => (bool) $settings->login_alerts,
                'last_password_change_at' => $settings->last_password_change_at,
            ],
        ];
    }
}
