<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the registration page can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
    $response->assertViewIs('landing');
});

test('a user can register for an account', function () {
    $this->withoutMiddleware();
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect('/home');
    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});

test('registration requires valid data', function () {
    $this->withoutMiddleware();
    $response = $this->post('/register', [
        'name' => '',
        'email' => 'invalid-email',
        'password' => 'short',
        'password_confirmation' => 'different',
    ]);

    $response->assertStatus(302); // Redirect back with errors
    $response->assertSessionHasErrors(['name', 'email', 'password']);
});
