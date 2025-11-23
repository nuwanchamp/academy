<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Http\Requests\UpdateNotificationSettingsRequest;
use App\Contexts\UserManagement\Http\Requests\UpdatePasswordRequest;
use App\Contexts\UserManagement\Http\Requests\UpdateProfileSettingsRequest;
use App\Contexts\UserManagement\Http\Resources\SettingsResource;
use App\Contexts\UserManagement\Models\User;
use App\Contexts\UserManagement\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class SettingsController extends Controller
{
    public function show(): SettingsResource
    {
        /** @var User $user */
        $user = request()->user();
        $settings = $this->resolveSettings($user);

        return new SettingsResource([
            'user' => $user,
            'settings' => $settings,
        ]);
    }

    public function updateProfile(UpdateProfileSettingsRequest $request): SettingsResource
    {
        /** @var User $user */
        $user = $request->user();
        $settings = $this->resolveSettings($user);

        $user->fill($request->only(['name', 'preferred_name', 'phone']));
        if ($request->filled('timezone')) {
            $user->timezone = $request->string('timezone')->toString();
            $settings->timezone = $user->timezone;
        }
        if ($request->filled('preferred_locale')) {
            $user->preferred_locale = $request->string('preferred_locale')->toString();
            $settings->preferred_locale = $user->preferred_locale;
        }

        $user->save();
        $settings->save();

        return new SettingsResource([
            'user' => $user,
            'settings' => $settings,
        ]);
    }

    public function updateNotifications(UpdateNotificationSettingsRequest $request): SettingsResource
    {
        /** @var User $user */
        $user = $request->user();
        $settings = $this->resolveSettings($user);

        $settings->notifications = $request->input('notifications');
        $settings->login_alerts = $request->boolean('login_alerts');
        $settings->save();

        return new SettingsResource([
            'user' => $user,
            'settings' => $settings,
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user->forceFill([
            'password' => Hash::make($request->input('new_password')),
        ]);
        $user->save();

        $settings = $this->resolveSettings($user);
        $settings->last_password_change_at = now();
        $settings->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    private function resolveSettings(User $user): UserSetting
    {
        $defaults = [
            'timezone' => $user->timezone ?? 'UTC',
            'preferred_locale' => $user->preferred_locale ?? 'en',
            'notifications' => [
                'study_session_reminders' => true,
                'progress_reports' => true,
                'guardian_messages' => true,
                'digest_emails' => false,
                'sms_alerts' => false,
                'in_app_messages' => true,
            ],
            'login_alerts' => true,
        ];

        return $user->settings()->firstOrCreate([], $defaults);
    }
}
