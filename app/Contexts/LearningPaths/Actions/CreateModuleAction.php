<?php

namespace App\Contexts\LearningPaths\Actions;

use App\Contexts\LearningPaths\Models\LessonMaterial;
use App\Contexts\LearningPaths\Models\LessonMediaUpload;
use App\Contexts\LearningPaths\Models\Module;
use App\Contexts\LearningPaths\Models\ModuleAuthor;
use App\Contexts\LearningPaths\Models\ModuleLesson;
use App\Contexts\LearningPaths\Models\ModuleTag;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateModuleAction
{
    public function execute(array $payload): Module
    {
        $tags = Arr::pull($payload, 'tags', []);
        $authors = Arr::pull($payload, 'authors', []);
        $lessons = Arr::pull($payload, 'lessons', []);

        /** @var Module $module */
        $module = DB::transaction(function () use ($payload, $tags, $authors, $lessons) {
            $module = Module::create($payload);

            $this->storeTags($module, $tags);
            $this->storeAuthors($module, $authors);
            $this->storeLessons($module, $lessons);

            $module->update(['lessons_count' => $module->lessons()->count()]);

            return $module->load([
                'tags',
                'authors',
                'lessons.materials',
                'lessons.mediaUploads',
            ]);
        });

        return $module;
    }

    private function storeTags(Module $module, array $tags): void
    {
        $uniqueTags = collect($tags)
            ->filter(fn ($tag) => is_string($tag) && trim($tag) !== '')
            ->unique()
            ->values();

        if ($uniqueTags->isEmpty()) {
            return;
        }

        $module->tags()->createMany(
            $uniqueTags->map(fn (string $tag) => ['name' => trim($tag)])->all()
        );
    }

    private function storeAuthors(Module $module, array $authors): void
    {
        if (empty($authors)) {
            return;
        }

        $payload = collect($authors)
            ->filter(fn ($author) => is_array($author) && !empty($author['name']))
            ->map(fn (array $author) => [
                'name' => $author['name'],
                'role' => $author['role'] ?? null,
                'bio' => $author['bio'] ?? null,
                'contact_links' => $author['contact_links'] ?? [],
            ])
            ->all();

        if (!empty($payload)) {
            $module->authors()->createMany($payload);
        }
    }

    private function storeLessons(Module $module, array $lessons): void
    {
        if (empty($lessons)) {
            return;
        }

        foreach ($lessons as $index => $lesson) {
            if (!is_array($lesson) || empty($lesson['title'])) {
                continue;
            }

            $materials = $lesson['materials'] ?? [];
            $mediaUploads = $lesson['media_uploads'] ?? [];
            $sequence = $lesson['sequence_order'] ?? $lesson['order'] ?? $index + 1;

            /** @var ModuleLesson $createdLesson */
            $createdLesson = $module->lessons()->create([
                'sequence_order' => $sequence,
                'title' => $lesson['title'],
                'summary' => $lesson['summary'] ?? null,
                'objectives' => $lesson['objectives'] ?? [],
                'body' => $lesson['body'] ?? null,
                'instructions' => $lesson['instructions'] ?? null,
                'outcomes' => $lesson['outcomes'] ?? [],
            ]);

            $this->storeLessonMaterials($createdLesson, $materials);
            $this->storeLessonMediaUploads($createdLesson, $mediaUploads);
        }
    }

    private function storeLessonMaterials(ModuleLesson $lesson, array $materials): void
    {
        if (empty($materials)) {
            return;
        }

        $lesson->materials()->createMany(
            collect($materials)
                ->filter(fn ($material) => is_array($material) && !empty($material['name']))
                ->map(fn (array $material) => [
                    'name' => $material['name'],
                    'file_type' => $material['file_type'] ?? null,
                    'file_size_bytes' => $material['file_size_bytes'] ?? null,
                    'storage_path' => $material['storage_path'] ?? null,
                    'external_url' => $material['external_url'] ?? null,
                    'meta' => $material['meta'] ?? [],
                ])
                ->all()
        );
    }

    private function storeLessonMediaUploads(ModuleLesson $lesson, array $uploads): void
    {
        if (empty($uploads)) {
            return;
        }

        $lesson->mediaUploads()->createMany(
            collect($uploads)
                ->filter(fn ($upload) => is_array($upload) && !empty($upload['file_name']))
                ->map(fn (array $upload) => [
                    'file_name' => $upload['file_name'],
                    'storage_path' => $upload['storage_path'] ?? '',
                    'mime_type' => $upload['mime_type'] ?? null,
                    'file_size_bytes' => $upload['file_size_bytes'] ?? null,
                    'meta' => $upload['meta'] ?? [],
                ])
                ->all()
        );
    }
}
