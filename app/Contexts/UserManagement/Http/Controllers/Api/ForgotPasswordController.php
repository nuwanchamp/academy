<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Actions\SendPasswordResetLinkAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForgotPasswordController
{
    public function __construct(private readonly SendPasswordResetLinkAction $sendLink)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        ($this->sendLink)($data['email']);

        return response()->json([
            'message' => __(
                'passwords.sent'
            ),
        ]);
    }
}

