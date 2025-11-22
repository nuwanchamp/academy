<?php

namespace App\Contexts\LearningPaths\Http\Requests;

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use Illuminate\Validation\Rule;

class UpdateModuleRequest extends StoreModuleRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $moduleId = $this->route('module')?->getKey();

        $rules = parent::rules();

        $rules['code'] = [
            'required',
            'string',
            'max:100',
            Rule::unique('modules', 'code')->ignore($moduleId),
        ];

        $rules['status'] = ['nullable', 'string', Rule::in(ModuleStatus::values())];

        return $rules;
    }
}
