<?php

namespace App\Contexts\UserManagement\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormTaxonomyResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'options' => $this->options ?? [],
            'updated_by' => $this->updated_by,
            'updated_at' => $this->updated_at,
        ];
    }
}
