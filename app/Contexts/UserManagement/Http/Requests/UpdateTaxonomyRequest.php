<?php

namespace App\Contexts\UserManagement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxonomyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'options' => ['required', 'array'],
            'options.*' => ['string', 'max:255'],
        ];
    }
}
