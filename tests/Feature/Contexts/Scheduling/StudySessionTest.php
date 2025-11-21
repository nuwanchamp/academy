<?php

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Carbon;
use Illuminate\Testing\Fluent\AssertableJson;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow('2025-01-01 09:00:00');
    Notification::fake();
    Bus::fake();
});

afterEach(function () {
    Carbon::setTestNow();
});

function studySessionPayload(): array {
    return [
        'title' => 'Reading Lab',
        'description' => 'Small group comprehension support.',
        'starts_at' => '2025-02-01 15:00:00',
        'ends_at' => '2025-02-01 16:00:00',
        'location' => 'Room 12',
        'meeting_url' => 'https://meet.example.com/read',
        'capacity' => 2,
        'timezone' => 'UTC',
        'recurrence' => null,
    ];
}

it('allows teachers to create study sessions', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/study-sessions', studySessionPayload());

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Reading Lab')
        ->assertJsonPath('data.teacher_id', $teacher->id)
        ->assertJsonPath('data.capacity', 2);

    $this->assertDatabaseHas('study_sessions', [
        'title' => 'Reading Lab',
        'teacher_id' => $teacher->id,
        'capacity' => 2,
    ]);
});

it('allows admins to create study sessions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/study-sessions', studySessionPayload());

    $response->assertCreated()->assertJsonPath('data.title', 'Reading Lab');
});

it('prevents overlapping study sessions for the same teacher', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    StudySession::factory()->for($teacher, 'teacher')->create([
        'starts_at' => '2025-02-01 10:00:00',
        'ends_at' => '2025-02-01 11:00:00',
    ]);

    $response = $this->postJson('/api/v1/study-sessions', array_merge(studySessionPayload(), [
        'starts_at' => '2025-02-01 10:30:00',
        'ends_at' => '2025-02-01 11:30:00',
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors(['starts_at']);
});

it('requires authentication to create study sessions', function () {
    $response = $this->postJson('/api/v1/study-sessions', studySessionPayload());

    $response->assertUnauthorized();
});

it('creates recurring study sessions and materializes occurrences', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/study-sessions', array_merge(studySessionPayload(), [
        'starts_at' => '2025-02-01 10:00:00',
        'ends_at' => '2025-02-01 11:00:00',
        'recurrence' => [
            'frequency' => 'weekly',
            'count' => 3,
        ],
    ]));

    $response->assertCreated()
        ->assertJsonPath('data.occurrences.0.starts_at', '2025-02-01 10:00:00')
        ->assertJsonCount(3, 'data.occurrences');

    $this->assertDatabaseCount('study_session_occurrences', 3);
});

it('updates an entire series and regenerates future occurrences', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $create = $this->postJson('/api/v1/study-sessions', array_merge(studySessionPayload(), [
        'starts_at' => '2025-02-01 10:00:00',
        'ends_at' => '2025-02-01 11:00:00',
        'recurrence' => [
            'frequency' => 'weekly',
            'count' => 2,
        ],
    ]))->json('data');

    $update = $this->patchJson("/api/v1/study-sessions/{$create['id']}", [
        'starts_at' => '2025-02-01 12:00:00',
        'ends_at' => '2025-02-01 13:00:00',
        'apply_to' => 'series',
    ]);

    $update->assertOk()
        ->assertJsonPath('data.starts_at', '2025-02-01 12:00:00')
        ->assertJsonPath('data.occurrences.0.ends_at', '2025-02-01 13:00:00')
        ->assertJsonPath('data.occurrences.1.starts_at', '2025-02-08 12:00:00');
});

it('updates a single occurrence without altering the rest of the series', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $create = $this->postJson('/api/v1/study-sessions', array_merge(studySessionPayload(), [
        'starts_at' => '2025-02-01 10:00:00',
        'ends_at' => '2025-02-01 11:00:00',
        'recurrence' => [
            'frequency' => 'weekly',
            'count' => 3,
        ],
    ]))->json('data');

    $firstOccurrenceId = $create['occurrences'][1]['id'];

    $update = $this->patchJson("/api/v1/study-sessions/{$create['id']}/occurrences/{$firstOccurrenceId}", [
        'starts_at' => '2025-02-08 14:00:00',
        'ends_at' => '2025-02-08 15:00:00',
    ]);

    $update->assertOk()
        ->assertJsonPath('data.starts_at', '2025-02-08 14:00:00')
        ->assertJsonPath('data.ends_at', '2025-02-08 15:00:00');

    $series = $this->getJson("/api/v1/study-sessions/{$create['id']}")->json('data');

    expect($series['occurrences'][0]['starts_at'])->toBe('2025-02-01 10:00:00');
    expect($series['occurrences'][2]['starts_at'])->toBe('2025-02-15 10:00:00');
});

it('cancels a single occurrence and a full series independently', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $create = $this->postJson('/api/v1/study-sessions', array_merge(studySessionPayload(), [
        'recurrence' => [
            'frequency' => 'weekly',
            'count' => 2,
        ],
    ]))->json('data');

    $occurrenceId = $create['occurrences'][0]['id'];

    $cancelSingle = $this->patchJson("/api/v1/study-sessions/{$create['id']}/occurrences/{$occurrenceId}", [
        'status' => 'cancelled',
    ]);
    $cancelSingle->assertOk()->assertJsonPath('data.status', 'cancelled');

    $cancelSeries = $this->patchJson("/api/v1/study-sessions/{$create['id']}", [
        'status' => 'cancelled',
        'apply_to' => 'series',
    ]);

    $cancelSeries->assertOk()->assertJsonPath('data.status', 'cancelled');

    $series = $this->getJson("/api/v1/study-sessions/{$create['id']}")->json('data');
    expect($series['status'])->toBe('cancelled');
    expect(collect($series['occurrences'])->pluck('status')->all())->toContain('cancelled');
});

it('lists only the authenticated teachers study sessions with enrollment counts', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $session = StudySession::factory()->for($teacher, 'teacher')->create([
        'title' => 'Math Support',
        'starts_at' => '2025-02-02 09:00:00',
        'ends_at' => '2025-02-02 10:00:00',
        'capacity' => 1,
    ]);
    $anotherSession = StudySession::factory()->for($teacher, 'teacher')->create([
        'title' => 'Writing Lab',
        'starts_at' => '2025-02-03 09:00:00',
        'ends_at' => '2025-02-03 10:30:00',
    ]);
    StudySession::factory()->for($otherTeacher, 'teacher')->create(); // should not appear

    $student = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);
    StudySessionEnrollment::factory()->for($session, 'session')->create([
        'student_id' => $student->id,
        'status' => EnrollmentStatus::ENROLLED,
    ]);
    StudySessionEnrollment::factory()->for($session, 'session')->create([
        'student_id' => Student::factory()->create([
            'case_manager_id' => $teacher->id,
            'teacher_id' => $teacher->id,
        ])->id,
        'status' => EnrollmentStatus::WAITLISTED,
        'waitlist_position' => 1,
    ]);

    $response = $this->getJson('/api/v1/study-sessions');

    $response->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', 2)
            ->where('data.0.title', 'Math Support')
            ->where('data.0.enrolled_count', 1)
            ->where('data.0.waitlist_count', 1)
            ->where('data.1.title', 'Writing Lab')
            ->where('data.1.enrolled_count', 0)
            ->where('data.1.waitlist_count', 0)
        );
});

it('enrolls students up to capacity then waitlists the rest', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);
    $session = StudySession::factory()->for($teacher, 'teacher')->create(['capacity' => 1]);

    $firstStudent = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);
    $secondStudent = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    $firstResponse = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $firstStudent->id,
    ]);
    $firstResponse->assertCreated()->assertJsonPath('data.status', EnrollmentStatus::ENROLLED->value);

    $secondResponse = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $secondStudent->id,
    ]);

    $secondResponse->assertCreated()
        ->assertJsonPath('data.status', EnrollmentStatus::WAITLISTED->value)
        ->assertJsonPath('data.waitlist_position', 1);

    $this->assertDatabaseHas('study_session_enrollments', [
        'study_session_id' => $session->id,
        'student_id' => $secondStudent->id,
        'status' => EnrollmentStatus::WAITLISTED->value,
        'waitlist_position' => 1,
    ]);
});

it('prevents duplicate enrollments and enforces caseload membership', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);
    Sanctum::actingAs($teacher);

    $session = StudySession::factory()->for($teacher, 'teacher')->create();
    $student = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);
    $outsideStudent = Student::factory()->create([
        'case_manager_id' => $otherTeacher->id,
        'teacher_id' => $otherTeacher->id,
    ]);

    $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $student->id,
    ])->assertCreated();

    $duplicate = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $student->id,
    ]);
    $duplicate->assertUnprocessable()->assertJsonValidationErrors(['student_id']);

    $outside = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $outsideStudent->id,
    ]);
    $outside->assertForbidden();
});

it('promotes waitlisted students when an enrollment is cancelled', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $guardian = User::factory()->create(['role' => 'parent', 'email' => 'guardian@example.com']);
    Sanctum::actingAs($teacher);
    $session = StudySession::factory()->for($teacher, 'teacher')->create(['capacity' => 1]);

    $firstStudent = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);
    $secondStudent = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    $secondStudent->guardians()->attach($guardian->id, [
        'relationship' => 'Mother',
        'access_level' => 'comment',
        'notifications_opt_in' => true,
    ]);

    $enrolled = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $firstStudent->id,
    ])->json('data');

    $waitlisted = $this->postJson("/api/v1/study-sessions/{$session->id}/enrollments", [
        'student_id' => $secondStudent->id,
    ])->json('data');

    expect($waitlisted['status'])->toBe(EnrollmentStatus::WAITLISTED->value);

    $cancel = $this->deleteJson("/api/v1/study-sessions/{$session->id}/enrollments/{$enrolled['id']}");

    $cancel->assertNoContent();

    $promoted = StudySessionEnrollment::find($waitlisted['id']);
    expect($promoted?->status)->toBe(EnrollmentStatus::ENROLLED);
    expect($promoted?->waitlist_position)->toBeNull();

    Notification::assertSentTo($guardian, \App\Contexts\Scheduling\Notifications\WaitlistPromoted::class);
});

it('sends notifications for creation, updates, cancellations, and promotions', function () {
    Bus::fake();
    Notification::fake();
    $teacher = User::factory()->create(['role' => 'teacher', 'email' => 'teacher@example.com']);
    Sanctum::actingAs($teacher);
    $student = Student::factory()->create([
        'case_manager_id' => $teacher->id,
        'teacher_id' => $teacher->id,
    ]);

    $create = $this->postJson('/api/v1/study-sessions', studySessionPayload())->json('data');

    Notification::assertSentTo($teacher, \App\Contexts\Scheduling\Notifications\StudySessionCreated::class);

    $this->patchJson("/api/v1/study-sessions/{$create['id']}", [
        'starts_at' => '2025-02-01 17:00:00',
        'ends_at' => '2025-02-01 18:00:00',
    ]);

    Notification::assertSentTo($teacher, \App\Contexts\Scheduling\Notifications\StudySessionUpdated::class);

    $enrollment = $this->postJson("/api/v1/study-sessions/{$create['id']}/enrollments", [
        'student_id' => $student->id,
    ])->json('data');

    $this->deleteJson("/api/v1/study-sessions/{$create['id']}/enrollments/{$enrollment['id']}");

    Notification::assertSentTo($teacher, \App\Contexts\Scheduling\Notifications\EnrollmentCancelled::class);
    Bus::assertDispatched(\App\Contexts\Scheduling\Jobs\SendStudySessionReminder::class);
});
