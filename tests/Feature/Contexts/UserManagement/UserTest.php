<?php

use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can be created using the factory', function () {
    $user = User::factory()->create();

    $this->assertNotNull($user);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => $user->email,
    ]);
});