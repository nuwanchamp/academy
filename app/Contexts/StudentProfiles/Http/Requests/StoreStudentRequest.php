<?php

namespace App\Contexts\StudentProfiles\Http\Requests;

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum as EnumRule;

class StoreStudentRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'preferred_name' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date'],
            'grade' => ['required', 'string', 'max:50'],
            'status' => ['nullable', new EnumRule(StudentStatus::class)],
            'diagnoses' => ['nullable', 'array'],
            'diagnoses.*' => ['string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'assessment_summary' => ['nullable', 'string'],
            'ieps_or_goals' => ['nullable', 'array'],
            'ieps_or_goals.*' => ['string', 'max:255'],
            'risk_flags' => ['nullable', 'array'],
            'risk_flags.*' => ['string', 'max:255'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'case_manager_id' => ['required', 'exists:users,id'],
            'current_learning_path_id' => ['nullable', 'integer'],
            'start_date' => ['nullable', 'date'],
            'guardians' => ['nullable', 'array'],
            'guardians.*.id' => ['required_with:guardians', 'exists:users,id'],
            'guardians.*.relationship' => ['nullable', 'string', 'max:100'],
            'guardians.*.is_primary' => ['nullable', 'boolean'],
            'guardians.*.access_level' => ['nullable', 'string', Rule::in(['view', 'comment'])],
            'guardians.*.notifications_opt_in' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated($key, $default);
        $validated['status'] = $validated['status'] ?? StudentStatus::ONBOARDING->value;

        return $validated;
    }
}
