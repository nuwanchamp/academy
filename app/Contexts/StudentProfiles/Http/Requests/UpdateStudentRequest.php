<?php

namespace App\Contexts\StudentProfiles\Http\Requests;

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum as EnumRule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'preferred_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'grade' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', new EnumRule(StudentStatus::class)],
            'diagnoses' => ['sometimes', 'nullable', 'array'],
            'diagnoses.*' => ['string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'assessment_summary' => ['sometimes', 'nullable', 'string'],
            'ieps_or_goals' => ['sometimes', 'nullable', 'array'],
            'ieps_or_goals.*' => ['string', 'max:255'],
            'risk_flags' => ['sometimes', 'nullable', 'array'],
            'risk_flags.*' => ['string', 'max:255'],
            'teacher_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'case_manager_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'current_learning_path_id' => ['sometimes', 'nullable', 'integer'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'guardians' => ['sometimes', 'array'],
            'guardians.*.id' => ['required_with:guardians', 'exists:users,id'],
            'guardians.*.relationship' => ['nullable', 'string', 'max:100'],
            'guardians.*.is_primary' => ['nullable', 'boolean'],
            'guardians.*.access_level' => ['nullable', 'string', Rule::in(['view', 'comment'])],
            'guardians.*.notifications_opt_in' => ['nullable', 'boolean'],
            'guardians.*.name' => ['nullable', 'string', 'max:255'],
            'guardians.*.email' => ['nullable', 'email', 'max:255'],
            'guardians.*.primary_phone' => ['nullable', 'string', 'max:50'],
            'guardians.*.address_line1' => ['nullable', 'string', 'max:255'],
        ];
    }
}
