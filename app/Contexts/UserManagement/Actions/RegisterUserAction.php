<?php

namespace App\Contexts\UserManagement\Actions;

use App\Contexts\UserManagement\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterUserAction
{
    public function __invoke(array $input): User
    {
        [$firstName, $lastName] = $this->splitName($input['name']);

        $defaultLocale = config('domain.locales')[0] ?? config('app.locale', 'en');

        return User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'name' => $input['name'],
            'preferred_name' => $firstName,
            'email' => $input['email'],
            'role' => config('domain.user_roles.default', 'teacher'),
            'timezone' => config('app.timezone', 'UTC'),
            'preferred_locale' => $defaultLocale,
            'password' => Hash::make($input['password']),
        ]);
    }

    private function splitName(string $name): array
    {
        $segments = preg_split('/\s+/', trim($name)) ?: [];

        $firstName = array_shift($segments) ?: $name;
        $lastName = implode(' ', $segments) ?: null;

        return [$firstName, $lastName];
    }
}

