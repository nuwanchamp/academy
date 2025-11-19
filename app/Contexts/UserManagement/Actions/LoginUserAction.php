<?php

namespace App\Contexts\UserManagement\Actions;

use App\Contexts\UserManagement\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    /**
     * @return array{user: User, token: string}
     * @throws ValidationException
     */
    public function __invoke(string $identifier, string $password): array
    {
        $query = User::query();

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = $query->where('email', $identifier)->first();
        } else {
            $user = $query->where('name', $identifier)->first();
        }

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => [__('auth.failed')],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'identifier' => [__('Account is inactive.')],
            ]);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('api')->plainTextToken;

        return [
            'user' => $user->fresh(),
            'token' => $token,
        ];
    }
}
