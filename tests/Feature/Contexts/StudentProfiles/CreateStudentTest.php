<?php

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function studentPayload(User $caseManager, array $overrides = []): array {
    return array_merge([
        'first_name' => 'Ava',
        'last_name' => 'Rivera',
        'preferred_name' => 'Avi',
        'date_of_birth' => '2017-08-12',
        'grade' => 'Grade 2',
        'status' => StudentStatus::ACTIVE->value,
        'diagnoses' => ['SPD', 'ADHD'],
        'notes' => 'Excels in sensory play.',
        'assessment_summary' => 'Shows strength in visual routines.',
        'ieps_or_goals' => ['Goal 1'],
        'risk_flags' => ['transition_support'],
        'teacher_id' => null,
        'case_manager_id' => $caseManager->id,
        'start_date' => '2024-01-15',
    ], $overrides);
}

it('allows an authenticated teacher to create a student profile', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $guardian = User::factory()->create(['role' => 'parent']);
    $guardian->guardianProfile()->create([
        'primary_phone' => '+15551234566',
    ]);

    Sanctum::actingAs($teacher);

    $payload = studentPayload($teacher, [
        'guardians' => [
            [
                'id' => $guardian->id,
                'relationship' => 'Mother',
                'is_primary' => true,
                'access_level' => 'comment',
                'notifications_opt_in' => false,
            ],
        ],
    ]);

    $response = $this->postJson('/api/v1/students', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.first_name', 'Ava')
        ->assertJsonPath('data.last_name', 'Rivera')
        ->assertJsonPath('data.notes', 'Excels in sensory play.')
        ->assertJsonPath('data.assessment_summary', 'Shows strength in visual routines.')
        ->assertJsonPath('data.guardians.0.id', $guardian->id);

    $this->assertDatabaseHas('students', [
        'first_name' => 'Ava',
        'last_name' => 'Rivera',
        'created_by' => $teacher->id,
    ]);

    $this->assertDatabaseHas('guardian_student', [
        'guardian_id' => $guardian->id,
        'relationship' => 'Mother',
        'access_level' => 'comment',
        'notifications_opt_in' => false,
    ]);
});

it('requires authentication to create a student', function () {
    $caseManager = User::factory()->create();

    $response = $this->postJson('/api/v1/students', studentPayload($caseManager));

    $response->assertUnauthorized();
});

it('validates required student fields', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/students', studentPayload($teacher, [
        'first_name' => null,
        'last_name' => null,
        'case_manager_id' => null,
        'grade' => null,
        'date_of_birth' => null,
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors(['first_name', 'last_name', 'case_manager_id', 'grade', 'date_of_birth']);
});
