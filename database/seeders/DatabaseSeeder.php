<?php

namespace Database\Seeders;

use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $defaultLocale = config('domain.locales')[0] ?? 'en';

        User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'name' => 'admin',
            'preferred_name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('admin'),
            'timezone' => config('app.timezone', 'UTC'),
            'preferred_locale' => $defaultLocale,
            'is_active' => true,
            'activated_at' => now(),
            'password_updated_at' => now(),
        ]);

        User::factory()->create([
            'first_name' => 'Taylor',
            'last_name' => 'Teacher',
            'name' => 'tteacher',
            'preferred_name' => 'Ms. Taylor',
            'email' => 'teacher@example.com',
            'role' => 'teacher',
            'password' => Hash::make('secret123'),
            'timezone' => config('app.timezone', 'UTC'),
            'preferred_locale' => $defaultLocale,
            'is_active' => true,
            'activated_at' => now(),
            'password_updated_at' => now(),
        ]);
    }
}
