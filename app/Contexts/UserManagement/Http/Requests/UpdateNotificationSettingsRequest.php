<?php

namespace App\Contexts\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'notifications' => ['required', 'array'],
            'notifications.study_session_reminders' => ['required', 'boolean'],
            'notifications.progress_reports' => ['required', 'boolean'],
            'notifications.guardian_messages' => ['required', 'boolean'],
            'notifications.digest_emails' => ['required', 'boolean'],
            'notifications.sms_alerts' => ['required', 'boolean'],
            'notifications.in_app_messages' => ['required', 'boolean'],
            'login_alerts' => ['required', 'boolean'],
        ];
    }
}
