<?php

namespace App\Contexts\LearningPaths\Http\Requests;

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use Illuminate\Validation\Rule;

class UpdatePathRequest extends StorePathRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $pathId = $this->route('path')?->getKey();

        $rules = parent::rules();

        $rules['code'] = [
            'required',
            'string',
            'max:100',
            Rule::unique('paths', 'code')->ignore($pathId),
        ];

        $rules['status'] = ['nullable', 'string', Rule::in(PathStatus::values())];
        $rules['visibility'] = ['nullable', 'string', Rule::in(PathVisibility::values())];

        return $rules;
    }
}
