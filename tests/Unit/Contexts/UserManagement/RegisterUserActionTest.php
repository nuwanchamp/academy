<?php

use App\Contexts\UserManagement\Actions\RegisterUserAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('register user action creates a teacher user with defaults', function (): void {
    $action = app(RegisterUserAction::class);

    $user = $action([
        'name' => 'Jamie Teacher',
        'email' => 'jamie@example.com',
        'password' => 'secret-pass',
    ]);

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->first_name)->toBe('Jamie')
        ->and($user->last_name)->toBe('Teacher')
        ->and($user->preferred_name)->toBe('Jamie')
        ->and($user->role)->toBe(config('domain.user_roles.default'))
        ->and($user->timezone)->toBe(config('app.timezone'))
        ->and($user->preferred_locale)->toBe(config('domain.locales')[0])
        ->and(Hash::check('secret-pass', $user->password))->toBeTrue();
});

test('register user action handles single-word names gracefully', function (): void {
    $action = app(RegisterUserAction::class);

    $user = $action([
        'name' => 'Ari',
        'email' => 'ari@example.com',
        'password' => 'secret-pass',
    ]);

    expect($user->first_name)->toBe('Ari')
        ->and($user->last_name)->toBeNull();
});

