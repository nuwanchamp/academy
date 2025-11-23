<?php

namespace App\Contexts\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'preferred_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'timezone' => ['sometimes', 'timezone:all'],
            'preferred_locale' => ['sometimes', 'string', 'max:8'],
        ];
    }
}
