<?php

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('allows an assigned teacher to update a student profile', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = Student::factory()->create([
        'first_name' => 'Ava',
        'last_name' => 'Rivera',
        'grade' => 'Grade 2',
        'status' => StudentStatus::ONBOARDING->value,
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    Sanctum::actingAs($teacher);

    $payload = [
        'first_name' => 'Ava Kate',
        'grade' => 'Grade 3',
        'status' => StudentStatus::ACTIVE->value,
        'notes' => 'Updated notes',
    ];

    $response = $this->patchJson("/api/v1/students/{$student->id}", $payload);

    $response
        ->assertOk()
        ->assertJsonPath('data.first_name', 'Ava Kate')
        ->assertJsonPath('data.grade', 'Grade 3')
        ->assertJsonPath('data.notes', 'Updated notes')
        ->assertJsonPath('data.status', StudentStatus::ACTIVE->value);

    $this->assertDatabaseHas('students', [
        'id' => $student->id,
        'first_name' => 'Ava Kate',
        'grade' => 'Grade 3',
        'status' => StudentStatus::ACTIVE->value,
        'updated_by' => $teacher->id,
    ]);
});

it('prevents teachers from updating profiles outside their caseload', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);

    $student = Student::factory()->create([
        'case_manager_id' => $otherTeacher->id,
        'teacher_id' => $otherTeacher->id,
    ]);

    Sanctum::actingAs($teacher);

    $response = $this->patchJson("/api/v1/students/{$student->id}", [
        'first_name' => 'Not Allowed',
    ]);

    $response->assertForbidden();
});

it('requires authentication for updates', function () {
    $student = Student::factory()->create();

    $response = $this->patchJson("/api/v1/students/{$student->id}", [
        'first_name' => 'No Auth',
    ]);

    $response->assertUnauthorized();
});
