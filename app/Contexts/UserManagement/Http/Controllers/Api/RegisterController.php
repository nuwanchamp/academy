<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Actions\RegisterUserAction;
use App\Contexts\UserManagement\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegisterController
{
    public function __construct(private readonly RegisterUserAction $registerUser)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = ($this->registerUser)($payload);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => UserResource::make($user)->resolve(),
            'token' => $token,
        ], 201);
    }
}

