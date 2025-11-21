<?php

namespace App\Contexts\Scheduling\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudySessionRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'location' => ['nullable', 'string', 'max:255'],
            'meeting_url' => ['nullable', 'url', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'timezone' => ['nullable', 'timezone:all'],
            'recurrence' => ['nullable', 'array'],
            'recurrence.frequency' => ['required_with:recurrence', 'in:daily,weekly'],
            'recurrence.count' => ['required_with:recurrence', 'integer', 'min:1', 'max:52'],
        ];
    }
}
