<?php

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('lists the authenticated teachers students with pagination metadata', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);

    $firstStudent = Student::factory()->create([
        'first_name' => 'Ivy',
        'last_name' => 'Anderson',
        'preferred_name' => 'Ivy A.',
        'grade' => 'Grade 2',
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    $secondStudent = Student::factory()->create([
        'first_name' => 'Noah',
        'last_name' => 'Zimmer',
        'preferred_name' => null,
        'grade' => 'Grade 3',
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    Student::factory()->create([
        'case_manager_id' => $otherTeacher->id,
        'teacher_id' => $otherTeacher->id,
    ]);

    Sanctum::actingAs($teacher);

    $response = $this->getJson('/api/v1/students?per_page=1');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('filters.grades.0', 'Grade 2');

    $response->assertJsonPath('data.0.id', $firstStudent->id);
    $response->assertJsonPath('data.0.name', 'Ivy A.');
    $response = $this->getJson('/api/v1/students?page=2&per_page=1');
    $response->assertJsonPath('data.0.id', $secondStudent->id);
    $response->assertJsonPath('data.0.name', 'Noah Zimmer');
});

it('applies search and grade filters server side', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    Student::factory()->create([
        'first_name' => 'Ava',
        'last_name' => 'Rivera',
        'grade' => 'Grade 2',
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    Student::factory()->create([
        'first_name' => 'Noah',
        'last_name' => 'Alvarez',
        'grade' => 'Grade 3',
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    $response = $this->getJson('/api/v1/students?grade=Grade%203&search=Noah');

    $response->assertOk()->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.first_name', 'Noah');
});

it('falls back to teacher assignment when case manager differs', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $caseManager = User::factory()->create(['role' => 'teacher']);

    $student = Student::factory()->create([
        'first_name' => 'Cam',
        'last_name' => 'Rivera',
        'case_manager_id' => $caseManager->id,
        'teacher_id' => $teacher->id,
    ]);

    Sanctum::actingAs($teacher);

    $response = $this->getJson('/api/v1/students');

    $response->assertOk()->assertJsonFragment([
        'id' => $student->id,
    ]);
});

it('requires authentication to list students', function () {
    $response = $this->getJson('/api/v1/students');

    $response->assertUnauthorized();
});
