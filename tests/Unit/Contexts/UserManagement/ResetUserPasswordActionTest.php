<?php

use App\Contexts\UserManagement\Actions\ResetUserPasswordAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('reset user password action updates password and timestamp', function (): void {
    $user = User::factory()->create([
        'password' => bcrypt('old-pass'),
    ]);

    $token = Password::broker()->createToken($user);

    $action = app(ResetUserPasswordAction::class);

    $action([
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $user->refresh();
    expect(Hash::check('new-password', $user->password))->toBeTrue();
    expect($user->password_updated_at)->not->toBeNull();
});

test('reset user password action validates token', function (): void {
    $user = User::factory()->create();

    $action = app(ResetUserPasswordAction::class);

    expect(fn () => $action([
        'token' => 'bad-token',
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]))->toThrow(ValidationException::class);
});

