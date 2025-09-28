<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can register for an account', function () {
    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->post(route('register'), $userData);

    $response->assertRedirect('/home');
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});
