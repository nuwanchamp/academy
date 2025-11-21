<?php

namespace App\Contexts\Scheduling\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudySessionOccurrenceRequest extends FormRequest
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
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'status' => ['sometimes', 'in:scheduled,cancelled'],
        ];
    }
}
