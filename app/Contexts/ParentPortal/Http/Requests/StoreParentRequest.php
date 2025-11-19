<?php

namespace App\Contexts\ParentPortal\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreParentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'preferred_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
            'primary_phone' => ['required', 'string', 'max:50'],
            'secondary_phone' => ['nullable', 'string', 'max:50'],
            'household_id' => ['nullable', 'string', 'max:50'],
            'address_line1' => ['nullable', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'preferred_contact_times' => ['nullable', 'string', 'max:255'],
            'communication_preferences' => ['nullable', 'array'],
            'communication_preferences.*' => ['string', 'max:50'],
            'send_portal_invite' => ['nullable', 'boolean'],
            'students' => ['nullable', 'array'],
            'students.*.id' => ['required_with:students', 'exists:students,id'],
            'students.*.relationship' => ['nullable', 'string', 'max:100'],
            'students.*.is_primary' => ['nullable', 'boolean'],
            'students.*.access_level' => ['nullable', 'string', Rule::in(['view', 'comment'])],
            'students.*.notifications_opt_in' => ['nullable', 'boolean'],
        ];
    }
}
