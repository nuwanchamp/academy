<?php

namespace App\Contexts\LearningPaths\Http\Requests;

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreModuleRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:100', Rule::unique('modules', 'code')],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'grade_band' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(ModuleStatus::values())],
            'version_label' => ['nullable', 'string', 'max:255'],
            'difficulty' => ['nullable', 'string', 'max:255'],
            'estimated_duration' => ['nullable', 'string', 'max:255'],
            'learning_type' => ['nullable', 'string', 'max:255'],
            'objectives' => ['nullable', 'array'],
            'objectives.*' => ['string'],
            'prerequisites' => ['nullable', 'array'],
            'prerequisites.*' => ['string'],
            'progress_tracking' => ['nullable', 'string'],
            'completion_criteria' => ['nullable', 'string'],
            'feedback_strategy' => ['nullable', 'string'],
            'access_control' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
            'archived_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'authors' => ['nullable', 'array'],
            'authors.*.name' => ['required_with:authors', 'string', 'max:255'],
            'authors.*.role' => ['nullable', 'string', 'max:255'],
            'authors.*.bio' => ['nullable', 'string'],
            'authors.*.contact_links' => ['nullable', 'array'],
            'authors.*.contact_links.*.label' => ['required_with:authors.*.contact_links', 'string', 'max:255'],
            'authors.*.contact_links.*.href' => ['required_with:authors.*.contact_links', 'string', 'max:2048'],
            'lessons' => ['nullable', 'array'],
            'lessons.*.title' => ['required_with:lessons', 'string', 'max:255'],
            'lessons.*.sequence_order' => ['nullable', 'integer', 'min:1'],
            'lessons.*.order' => ['nullable', 'integer', 'min:1'],
            'lessons.*.summary' => ['nullable', 'string'],
            'lessons.*.objectives' => ['nullable', 'array'],
            'lessons.*.objectives.*' => ['string'],
            'lessons.*.body' => ['nullable', 'string'],
            'lessons.*.instructions' => ['nullable', 'string'],
            'lessons.*.outcomes' => ['nullable', 'array'],
            'lessons.*.outcomes.*' => ['string'],
            'lessons.*.materials' => ['nullable', 'array'],
            'lessons.*.materials.*.name' => ['required_with:lessons.*.materials', 'string', 'max:255'],
            'lessons.*.materials.*.file_type' => ['nullable', 'string', 'max:255'],
            'lessons.*.materials.*.file_size_bytes' => ['nullable', 'integer', 'min:0'],
            'lessons.*.materials.*.storage_path' => ['nullable', 'string', 'max:1024'],
            'lessons.*.materials.*.external_url' => ['nullable', 'string', 'max:2048'],
            'lessons.*.materials.*.meta' => ['nullable', 'array'],
            'lessons.*.media_uploads' => ['nullable', 'array'],
            'lessons.*.media_uploads.*.file_name' => ['required_with:lessons.*.media_uploads', 'string', 'max:255'],
            'lessons.*.media_uploads.*.storage_path' => ['nullable', 'string', 'max:1024'],
            'lessons.*.media_uploads.*.mime_type' => ['nullable', 'string', 'max:255'],
            'lessons.*.media_uploads.*.file_size_bytes' => ['nullable', 'integer', 'min:0'],
            'lessons.*.media_uploads.*.meta' => ['nullable', 'array'],
        ];
    }

    public function payload(): array
    {
        $data = $this->validated();

        $data['status'] = $data['status'] ?? ModuleStatus::DRAFT->value;

        if (isset($data['lessons']) && is_array($data['lessons'])) {
            $data['lessons'] = array_map(function (array $lesson) {
                if (!isset($lesson['sequence_order']) && isset($lesson['order'])) {
                    $lesson['sequence_order'] = $lesson['order'];
                }
                unset($lesson['order']);
                return $lesson;
            }, $data['lessons']);
        }

        return $data;
    }
}
