<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('users can request a password reset link via api', function (): void {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/password/forgot', [
        'email' => $user->email,
    ]);

    $response->assertOk()
        ->assertJson(['message' => __('passwords.sent')]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset request validates email', function (): void {
    $response = $this->postJson('/api/v1/password/forgot', [
        'email' => 'not-an-email',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('users can reset password via api', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('old-pass'),
    ]);

    $token = Password::broker()->createToken($user);

    $response = $this->postJson('/api/v1/password/reset', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertOk()
        ->assertJson(['message' => __('passwords.reset')]);

    $user->refresh();
    expect(Hash::check('new-password', $user->password))->toBeTrue();
    expect($user->password_updated_at)->not->toBeNull();
});

test('password reset endpoint errors on invalid token', function (): void {
    $user = User::factory()->create();

    $response = $this->postJson('/api/v1/password/reset', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});
