<?php

namespace App\Contexts\UserManagement\Database\Factories;

use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();

        $roles = config('domain.user_roles.supported', ['teacher', 'parent']);
        $defaultRole = config('domain.user_roles.default', 'teacher');
        $role = $roles[array_rand($roles)] ?? $defaultRole;

        $locales = config('domain.locales', ['en']);
        $preferredLocale = $locales[array_rand($locales)] ?? 'en';

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'name' => $firstName.' '.$lastName,
            'preferred_name' => $firstName,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'phone' => fake()->phoneNumber(),
            'timezone' => fake()->timezone(),
            'preferred_locale' => $preferredLocale,
            'role' => $role,
            'is_active' => true,
            'permissions' => null,
            'password_updated_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
