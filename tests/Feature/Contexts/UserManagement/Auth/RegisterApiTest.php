<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users can register via the api and receive a token', function (): void {
    $response = $this->postJson('/api/v1/register', [
        'name' => 'Kay Teacher',
        'email' => 'kay@example.com',
        'password' => 'secret-pass',
        'password_confirmation' => 'secret-pass',
    ]);

    $response->assertCreated()
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'role', 'preferred_locale', 'timezone', 'is_active', 'last_login_at'],
            'token',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'kay@example.com',
        'role' => config('domain.user_roles.default', 'teacher'),
    ]);

    $user = User::whereEmail('kay@example.com')->first();
    $this->assertNotNull($user);

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $user->id,
        'tokenable_type' => User::class,
    ]);
});

test('api registration validates payload', function (): void {
    $response = $this->postJson('/api/v1/register', [
        'name' => '',
        'email' => 'bad-email',
        'password' => 'short',
        'password_confirmation' => 'different',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});

