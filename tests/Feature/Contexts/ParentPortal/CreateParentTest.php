<?php

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('lists parents with guardian profiles', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $guardians = User::factory()->count(2)->create(['role' => 'parent']);

    foreach ($guardians as $parent) {
        $parent->guardianProfile()->create([
            'primary_phone' => fake()->phoneNumber(),
        ]);
    }

    Sanctum::actingAs($teacher);

    $response = $this->getJson('/api/v1/parents');

    $response->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'user' => ['id', 'email', 'role'],
                    'profile' => ['primary_phone'],
                    'students',
                ],
            ],
        ]);
});

it('creates a parent with guardian profile and links to students', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = Student::factory()->create();

    Sanctum::actingAs($teacher);

    $payload = [
        'first_name' => 'Leah',
        'last_name' => 'Mendoza',
        'email' => 'leah@example.com',
        'password' => 'secret123',
        'primary_phone' => '+15551234567',
        'household_id' => 'HH-001',
        'preferred_contact_times' => 'Evenings',
        'communication_preferences' => ['email', 'sms'],
        'send_portal_invite' => true,
        'students' => [
            [
                'id' => $student->id,
                'relationship' => 'Mother',
                'is_primary' => true,
                'access_level' => 'comment',
                'notifications_opt_in' => false,
            ],
        ],
    ];

    $response = $this->postJson('/api/v1/parents', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.user.email', 'leah@example.com')
        ->assertJsonPath('data.profile.primary_phone', '+15551234567')
        ->assertJsonPath('data.students.0.id', $student->id)
        ->assertJsonPath('data.students.0.pivot.relationship', 'Mother');

    $parent = User::where('email', 'leah@example.com')->first();

    $this->assertNotNull($parent);
    $this->assertSame('parent', $parent->role);
    $this->assertNotNull($parent->invited_at);

    $this->assertDatabaseHas('guardian_profiles', [
        'user_id' => $parent->id,
        'primary_phone' => '+15551234567',
    ]);

    $this->assertDatabaseHas('guardian_student', [
        'guardian_id' => $parent->id,
        'student_id' => $student->id,
        'relationship' => 'Mother',
        'access_level' => 'comment',
        'notifications_opt_in' => false,
    ]);
});

it('requires authentication to create a parent', function () {
    $response = $this->postJson('/api/v1/parents', []);

    $response->assertUnauthorized();
});

it('validates required parent fields', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/parents', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'primary_phone']);
});
