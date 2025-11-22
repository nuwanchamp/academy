<?php

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use App\Contexts\LearningPaths\Models\Module;
use App\Contexts\LearningPaths\Models\Path;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function pathPayload(array $overrides = []): array {
    $module = Module::factory()->create();

    return array_merge([
        'code' => 'PATH-TEST-001',
        'title' => 'Regulation Builder Program',
        'summary' => 'Sequenced modules to build core regulation skills.',
        'subject' => 'Wellness',
        'grade_band' => 'Grades 3 – 5',
        'status' => PathStatus::PUBLISHED->value,
        'visibility' => PathVisibility::SCHOOL->value,
        'pacing' => '6 weeks',
        'objectives' => ['Self-regulation', 'Mindfulness routines'],
        'success_metrics' => ['Students complete checkpoints', 'Students reflect weekly'],
        'planned_release_date' => now()->addWeek()->toDateString(),
        'modules' => [
            ['id' => $module->id, 'sequence_order' => 1],
        ],
    ], $overrides);
}

it('requires authentication for path endpoints', function () {
    $response = $this->getJson('/api/v1/paths');
    $response->assertUnauthorized();
});

it('lists paths with filter metadata', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $path = Path::factory()->create([
        'subject' => 'Science',
        'grade_band' => 'Grades 6 – 8',
        'status' => PathStatus::PUBLISHED->value,
        'visibility' => PathVisibility::DISTRICT->value,
    ]);

    $response = $this->getJson('/api/v1/paths');

    $response
        ->assertOk()
        ->assertJsonPath('data.0.title', $path->title)
        ->assertJsonPath('filters.subjects.0', 'Science')
        ->assertJsonPath('filters.grade_bands.0', 'Grades 6 – 8')
        ->assertJsonPath('filters.visibilities.0', PathVisibility::DISTRICT->value);
});

it('shows a path with ordered modules', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $firstModule = Module::factory()->create(['title' => 'Intro']);
    $secondModule = Module::factory()->create(['title' => 'Deep Dive']);

    $path = Path::factory()->create([
        'code' => 'PATH-TEST-002',
        'status' => PathStatus::DRAFT->value,
    ]);
    $path->modules()->attach($firstModule->id, ['sequence_order' => 2]);
    $path->modules()->attach($secondModule->id, ['sequence_order' => 1]);

    $response = $this->getJson("/api/v1/paths/{$path->id}");

    $response
        ->assertOk()
        ->assertJsonPath('data.code', 'PATH-TEST-002')
        ->assertJsonPath('data.modules.0.title', 'Deep Dive')
        ->assertJsonPath('data.modules.0.sequence_order', 1)
        ->assertJsonPath('data.modules.1.title', 'Intro');
});

it('creates a path with modules', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $payload = pathPayload();

    $response = $this->postJson('/api/v1/paths', $payload);

    $response->assertCreated();

    $response->assertJson(fn (AssertableJson $json) => $json
        ->where('data.code', 'PATH-TEST-001')
        ->where('data.modules.0.sequence_order', 1)
        ->where('data.status', PathStatus::PUBLISHED->value)
        ->etc()
    );

    $this->assertDatabaseHas('paths', [
        'code' => 'PATH-TEST-001',
        'status' => PathStatus::PUBLISHED->value,
        'visibility' => PathVisibility::SCHOOL->value,
    ]);

    $this->assertDatabaseHas('path_modules', [
        'sequence_order' => 1,
    ]);
});

it('validates required path fields', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/paths', pathPayload([
        'code' => null,
        'title' => null,
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors(['code', 'title']);
});

it('updates a path and reorders modules', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $path = Path::factory()->create(['code' => 'PATH-TEST-003']);
    $existingModule = Module::factory()->create();
    $newModule = Module::factory()->create();
    $path->modules()->attach($existingModule->id, ['sequence_order' => 1]);

    $response = $this->patchJson("/api/v1/paths/{$path->id}", [
        'code' => 'PATH-TEST-003',
        'title' => 'Updated Path',
        'modules' => [
            ['id' => $newModule->id, 'sequence_order' => 1],
            ['id' => $existingModule->id, 'sequence_order' => 2],
        ],
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.title', 'Updated Path')
        ->assertJsonPath('data.modules.0.id', $newModule->id)
        ->assertJsonPath('data.modules.0.sequence_order', 1);

    $this->assertDatabaseHas('path_modules', [
        'path_id' => $path->id,
        'module_id' => $existingModule->id,
        'sequence_order' => 2,
    ]);
});

it('deletes a path', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $path = Path::factory()->create();

    $response = $this->deleteJson("/api/v1/paths/{$path->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('paths', ['id' => $path->id]);
});
