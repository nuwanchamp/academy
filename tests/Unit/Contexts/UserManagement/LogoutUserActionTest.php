<?php

use App\Contexts\UserManagement\Actions\LogoutUserAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('logout user action deletes current access token', function (): void {
    $user = User::factory()->create();
    $token = $user->createToken('api');

    $user->withAccessToken($token->accessToken);

    $action = app(LogoutUserAction::class);

    $action($user);

    $this->assertDatabaseEmpty('personal_access_tokens');
});

test('logout user action deletes all tokens when requested', function (): void {
    $user = User::factory()->create();
    $user->createToken('web');
    $user->createToken('mobile');

    $action = app(LogoutUserAction::class);

    $action($user, true);

    $this->assertDatabaseEmpty('personal_access_tokens');
});

