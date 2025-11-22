<?php

namespace App\Contexts\LearningPaths\Http\Requests;

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePathRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:100', Rule::unique('paths', 'code')],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'grade_band' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(PathStatus::values())],
            'visibility' => ['nullable', 'string', Rule::in(PathVisibility::values())],
            'pacing' => ['nullable', 'string', 'max:255'],
            'objectives' => ['nullable', 'array'],
            'objectives.*' => ['string'],
            'success_metrics' => ['nullable', 'array'],
            'success_metrics.*' => ['string'],
            'planned_release_date' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
            'archived_at' => ['nullable', 'date'],
            'owner_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'modules' => ['nullable', 'array'],
            'modules.*.id' => ['required_with:modules', 'integer', 'exists:modules,id'],
            'modules.*.sequence_order' => ['nullable', 'integer', 'min:1'],
            'modules.*.order' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function payload(): array
    {
        $data = $this->validated();

        $data['status'] = $data['status'] ?? PathStatus::DRAFT->value;
        $data['visibility'] = $data['visibility'] ?? PathVisibility::PRIVATE->value;

        if (isset($data['modules']) && is_array($data['modules'])) {
            $data['modules'] = collect($data['modules'])
                ->map(function (array $module, int $index) {
                    $module['sequence_order'] = $module['sequence_order'] ?? $module['order'] ?? $index + 1;
                    unset($module['order']);
                    return $module;
                })
                ->values()
                ->all();
        }

        return $data;
    }
}
