<?php

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('shows a student for their assigned case manager', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $student = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
        'first_name' => 'Ava',
        'last_name' => 'Rivera',
        'notes' => 'Excels in sensory play.',
    ]);

    $response = $this->getJson("/api/v1/students/{$student->id}");

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $student->id)
        ->assertJsonPath('data.first_name', 'Ava')
        ->assertJsonPath('data.notes', 'Excels in sensory play.');
});

it('allows the assigned teacher even if case manager differs', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $caseManager = User::factory()->create(['role' => 'teacher']);

    Sanctum::actingAs($teacher);

    $student = Student::factory()->create([
        'case_manager_id' => $caseManager->id,
        'teacher_id' => $teacher->id,
    ]);

    $response = $this->getJson("/api/v1/students/{$student->id}");

    $response->assertOk()->assertJsonPath('data.id', $student->id);
});

it('forbids viewing students outside the caseload', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);

    Sanctum::actingAs($teacher);

    $student = Student::factory()->create([
        'case_manager_id' => $otherTeacher->id,
        'teacher_id' => $otherTeacher->id,
    ]);

    $response = $this->getJson("/api/v1/students/{$student->id}");

    $response->assertForbidden();
});

it('requires authentication to view a student profile', function () {
    $student = Student::factory()->create();

    $response = $this->getJson("/api/v1/students/{$student->id}");

    $response->assertUnauthorized();
});
