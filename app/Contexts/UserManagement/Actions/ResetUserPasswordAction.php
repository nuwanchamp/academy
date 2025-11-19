<?php

namespace App\Contexts\UserManagement\Actions;

use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResetUserPasswordAction
{
    /**
     * @param  array{email:string,password:string,password_confirmation:string,token:string}  $credentials
     *
     * @throws ValidationException
     */
    public function __invoke(array $credentials): void
    {
        $status = Password::reset($credentials, function (User $user) use ($credentials): void {
            $user->forceFill([
                'password' => Hash::make($credentials['password']),
                'remember_token' => Str::random(60),
                'password_updated_at' => now(),
            ])->save();

            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }
}

