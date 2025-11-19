<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Actions\LoginUserAction;
use App\Contexts\UserManagement\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

readonly class LoginController
{
    public function __construct(private LoginUserAction $loginUser)
    {
    }

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $result = ($this->loginUser)($credentials['identifier'], $credentials['password']);

        $user = $result['user'];

        return response()->json([
            'user' => UserResource::make($user)->resolve(),
            'token' => $result['token'],
        ]);
    }
}
