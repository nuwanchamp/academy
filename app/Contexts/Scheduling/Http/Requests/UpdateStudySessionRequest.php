<?php

namespace App\Contexts\Scheduling\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudySessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $role = $this->user()?->role;
        return $role === 'teacher' || $role === 'admin';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meeting_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'timezone' => ['sometimes', 'timezone:all'],
            'status' => ['sometimes', 'in:scheduled,cancelled'],
            'apply_to' => ['nullable', 'in:series'],
            'recurrence' => ['sometimes', 'array'],
            'recurrence.frequency' => ['required_with:recurrence', 'in:daily,weekly'],
            'recurrence.count' => ['required_with:recurrence', 'integer', 'min:1', 'max:52'],
        ];
    }
}
