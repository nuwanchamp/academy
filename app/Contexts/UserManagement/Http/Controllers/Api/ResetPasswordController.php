<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Actions\ResetUserPasswordAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

readonly class ResetPasswordController
{
    public function __construct(private ResetUserPasswordAction $resetUserPassword)
    {
    }

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        ($this->resetUserPassword)($payload);

        return response()->json([
            'message' => __('passwords.reset'),
        ]);
    }
}

