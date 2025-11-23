<?php

use App\Contexts\UserManagement\Models\FormTaxonomy;
use App\Contexts\UserManagement\Models\User;
use App\Contexts\UserManagement\Models\UserSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createUser(array $attributes = []): User
{
    return User::factory()->create($attributes);
}

test('authenticated user can view settings', function () {
    $user = createUser();
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/settings/me');

    $response->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('settings.notifications.study_session_reminders', true);
});

test('profile settings can be updated', function () {
    $user = createUser(['timezone' => 'UTC', 'preferred_locale' => 'en']);
    Sanctum::actingAs($user);

    $response = $this->patchJson('/api/v1/settings/me', [
        'name' => 'Updated Name',
        'preferred_name' => 'Updated',
        'phone' => '123-456-7890',
        'timezone' => 'America/New_York',
        'preferred_locale' => 'si',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.name', 'Updated Name')
        ->assertJsonPath('user.timezone', 'America/New_York')
        ->assertJsonPath('user.preferred_locale', 'si');

    expect($user->fresh()->timezone)->toBe('America/New_York');
    expect($user->settings()->first()->preferred_locale)->toBe('si');
});

test('notification settings can be updated', function () {
    $user = createUser();
    Sanctum::actingAs($user);

    $payload = [
        'notifications' => [
            'study_session_reminders' => false,
            'progress_reports' => false,
            'guardian_messages' => true,
            'digest_emails' => true,
            'sms_alerts' => true,
            'in_app_messages' => false,
        ],
        'login_alerts' => false,
    ];

    $response = $this->patchJson('/api/v1/settings/notifications', $payload);

    $response->assertOk()
        ->assertJsonPath('settings.notifications.guardian_messages', true)
        ->assertJsonPath('settings.login_alerts', false);

    $settings = UserSetting::where('user_id', $user->id)->first();
    expect($settings->notifications['sms_alerts'])->toBeTrue();
});

test('password update requires current password', function () {
    $user = createUser(['password' => bcrypt('old-password')]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/settings/password', [
        'current_password' => 'wrong',
        'new_password' => 'new-password',
        'new_password_confirmation' => 'new-password',
    ])->assertStatus(422);

    $this->postJson('/api/v1/settings/password', [
        'current_password' => 'old-password',
        'new_password' => 'new-password',
        'new_password_confirmation' => 'new-password',
    ])->assertOk();
});

test('admin can update taxonomies', function () {
    $admin = createUser(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->patchJson('/api/v1/settings/taxonomies/student_diagnoses', [
        'options' => ['OCD', 'ADHD', 'New item'],
    ]);

    $response->assertOk()
        ->assertJsonPath('key', 'student_diagnoses')
        ->assertJsonPath('options.2', 'New item');

    $stored = FormTaxonomy::where('key', 'student_diagnoses')->first();
    expect($stored->options)->toContain('New item');
});

test('non-admin cannot update taxonomies', function () {
    $teacher = createUser(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $this->patchJson('/api/v1/settings/taxonomies/module_subjects', [
        'options' => ['Math'],
    ])->assertStatus(403);
});
