<?php

use App\Contexts\UserManagement\Actions\LoginUserAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('login user action returns user and token for valid credentials', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $action = app(LoginUserAction::class);

    $result = $action($user->email, 'secret-pass');

    expect($result['user']->is($user))->toBeTrue()
        ->and($result['token'])->toBeString();
    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $user->id,
    ]);

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

test('login user action throws on invalid credentials', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $action = app(LoginUserAction::class);

    expect(fn () => $action($user->email, 'wrong-pass'))
        ->toThrow(ValidationException::class);
});

test('login user action throws when user is inactive', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
        'is_active' => false,
    ]);

    $action = app(LoginUserAction::class);

    expect(fn () => $action($user->email, 'secret-pass'))
        ->toThrow(ValidationException::class);
});

test('login user action allows using the name identifier', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('secret-pass'),
        'name' => 'teacher_one',
    ]);

    $action = app(LoginUserAction::class);

    $result = $action('teacher_one', 'secret-pass');

    expect($result['user']->is($user))->toBeTrue();
});
