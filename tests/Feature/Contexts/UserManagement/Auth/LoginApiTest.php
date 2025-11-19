<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users can obtain an api token via login endpoint', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $response = $this->postJson('/api/v1/login', [
        'identifier' => $user->email,
        'password' => 'secret-pass',
    ]);

    $response->assertOk()
        ->assertJson([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'preferred_locale' => $user->preferred_locale,
                'timezone' => $user->timezone,
                'is_active' => true,
            ],
        ])
        ->assertJsonStructure(['user' => ['last_login_at'], 'token']);

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $user->id,
        'tokenable_type' => User::class,
    ]);

    $this->assertNotNull($user->fresh()->last_login_at);
});

test('login fails when credentials are invalid', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $response = $this->postJson('/api/v1/login', [
        'identifier' => $user->email,
        'password' => 'wrong-pass',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['identifier']);

    $this->assertDatabaseEmpty('personal_access_tokens');
});

test('inactive users cannot log in', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/v1/login', [
        'identifier' => $user->email,
        'password' => 'secret-pass',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['identifier']);

    $this->assertDatabaseEmpty('personal_access_tokens');
});

test('authenticated users can log out via api', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $token = $user->createToken('api')->plainTextToken;

    $response = $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/logout');

    $response->assertNoContent();

    $this->assertDatabaseEmpty('personal_access_tokens');
});

test('logout requires authentication', function (): void {
    $response = $this->postJson('/api/v1/logout');

    $response->assertUnauthorized();
});
test('users can login using name identifier', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
        'name' => 'teacher_one',
    ]);

    $response = $this->postJson('/api/v1/login', [
        'identifier' => 'teacher_one',
        'password' => 'secret-pass',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.name', 'teacher_one');
});
