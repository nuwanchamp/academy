<?php

namespace App\Contexts\ParentPortal\Http\Controllers\Api;

use App\Contexts\ParentPortal\Models\GuardianProfile;
use App\Contexts\ParentPortal\Http\Resources\ParentResource;
use Illuminate\Http\JsonResponse;

class ListParentsController
{
    public function __invoke(): JsonResponse
    {
        $guardians = GuardianProfile::with(['user', 'students'])->latest()->get();

        return response()->json([
            'data' => ParentResource::collection($guardians)->resolve(),
        ]);
    }
}
