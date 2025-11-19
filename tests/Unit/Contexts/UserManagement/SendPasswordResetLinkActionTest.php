<?php

use App\Contexts\UserManagement\Actions\SendPasswordResetLinkAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

test('send password reset link action dispatches notification', function (): void {
    Notification::fake();

    $user = User::factory()->create();

    $action = app(SendPasswordResetLinkAction::class);

    $action($user->email);

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

test('send password reset link action errors for unknown email', function (): void {
    $action = app(SendPasswordResetLinkAction::class);

    expect(fn () => $action('nobody@example.com'))
        ->toThrow(ValidationException::class);
});

