<?php

use App\Contexts\LearningPaths\Enums\ModuleStatus;
use App\Contexts\LearningPaths\Models\Module;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function modulePayload(array $overrides = []): array {
    return array_merge([
        'code' => 'MOD-TEST-001',
        'title' => 'Sensory Exploration Foundations',
        'summary' => 'Build shared language around the senses.',
        'subject' => 'Wellness',
        'grade_band' => 'Grades 3 – 5',
        'status' => ModuleStatus::PUBLISHED->value,
        'version_label' => 'v1.0',
        'difficulty' => 'Beginner',
        'estimated_duration' => '2 weeks',
        'learning_type' => 'Hands-on',
        'objectives' => ['Build vocabulary', 'Introduce calming techniques'],
        'prerequisites' => ['Baseline sensory assessment'],
        'progress_tracking' => 'Daily micro-checkpoints',
        'completion_criteria' => 'All lessons completed',
        'feedback_strategy' => 'Teacher reflections captured in-app',
        'access_control' => 'teachers',
        'tags' => ['sensory', 'mindfulness'],
        'authors' => [
            [
                'name' => 'Alex Rivera',
                'role' => 'Lead Occupational Therapist',
                'bio' => 'Designs play-first interventions.',
                'contact_links' => [
                    ['label' => 'Email', 'href' => 'mailto:alex@example.com'],
                ],
            ],
        ],
        'lessons' => [
            [
                'title' => 'Lesson 1',
                'sequence_order' => 1,
                'summary' => 'Warm up and baseline',
                'objectives' => ['Introduce senses'],
                'body' => 'Lesson body',
                'instructions' => 'Do the thing',
                'outcomes' => ['Learners can name each sense'],
                'materials' => [
                    [
                        'name' => 'Slides',
                        'file_type' => 'pdf',
                        'external_url' => 'https://example.com/slides.pdf',
                    ],
                ],
            ],
        ],
    ], $overrides);
}

it('requires authentication for module endpoints', function () {
    $response = $this->getJson('/api/v1/modules');
    $response->assertUnauthorized();
});

it('lists modules with filter metadata', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $module = Module::factory()->create([
        'subject' => 'Science',
        'grade_band' => 'Grades 3 – 5',
        'status' => ModuleStatus::PUBLISHED->value,
    ]);
    $module->tags()->create(['name' => 'inquiry']);

    $response = $this->getJson('/api/v1/modules');

    $response
        ->assertOk()
        ->assertJsonPath('data.0.title', $module->title)
        ->assertJsonPath('data.0.tags.0', 'inquiry')
        ->assertJsonPath('filters.subjects.0', 'Science')
        ->assertJsonPath('filters.grade_bands.0', 'Grades 3 – 5');
});

it('shows a module with nested relationships', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $module = Module::factory()->create([
        'code' => 'MOD-TEST-002',
        'status' => ModuleStatus::DRAFT->value,
    ]);

    $module->authors()->create([
        'name' => 'Sam Teacher',
        'role' => 'Author',
        'bio' => 'Writes lessons.',
    ]);

    $lesson = $module->lessons()->create([
        'sequence_order' => 1,
        'title' => 'Lesson intro',
        'summary' => 'Intro summary',
    ]);
    $lesson->materials()->create([
        'name' => 'PDF',
        'file_type' => 'pdf',
        'external_url' => 'https://example.com',
    ]);

    $response = $this->getJson("/api/v1/modules/{$module->id}");

    $response
        ->assertOk()
        ->assertJsonPath('data.code', 'MOD-TEST-002')
        ->assertJsonPath('data.authors.0.name', 'Sam Teacher')
        ->assertJsonPath('data.lessons.0.title', 'Lesson intro')
        ->assertJsonPath('data.lessons.0.materials.0.name', 'PDF');
});

it('creates a module with authors, tags, and lessons', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $payload = modulePayload();

    $response = $this->postJson('/api/v1/modules', $payload);

    $response->assertCreated();

    $response->assertJson(fn (AssertableJson $json) => $json
        ->where('data.code', 'MOD-TEST-001')
        ->where('data.authors.0.name', 'Alex Rivera')
        ->where('data.lessons.0.sequence_order', 1)
        ->etc()
    );

    $this->assertContains('sensory', $response->json('data.tags'));
    $this->assertContains('mindfulness', $response->json('data.tags'));

    $this->assertDatabaseHas('modules', [
        'code' => 'MOD-TEST-001',
        'status' => ModuleStatus::PUBLISHED->value,
    ]);

    $this->assertDatabaseHas('module_tags', [
        'name' => 'sensory',
    ]);

    $this->assertDatabaseHas('module_lessons', [
        'title' => 'Lesson 1',
    ]);
});

it('validates required module fields', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $response = $this->postJson('/api/v1/modules', modulePayload([
        'code' => null,
        'title' => null,
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors(['code', 'title']);
});

it('deletes a module', function () {
    $teacher = User::factory()->create();
    Sanctum::actingAs($teacher);

    $module = Module::factory()->create();

    $response = $this->deleteJson("/api/v1/modules/{$module->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('modules', ['id' => $module->id]);
});
