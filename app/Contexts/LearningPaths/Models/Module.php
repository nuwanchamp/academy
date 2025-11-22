<?php

namespace App\Contexts\LearningPaths\Models;

use App\Contexts\LearningPaths\Database\Factories\ModuleFactory;
use App\Contexts\LearningPaths\Enums\ModuleStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Module extends Model
{
    /** @use HasFactory<ModuleFactory> */
    use HasFactory;

    protected $fillable = [
        'uuid',
        'code',
        'title',
        'summary',
        'subject',
        'grade_band',
        'status',
        'version_label',
        'difficulty',
        'estimated_duration',
        'learning_type',
        'lessons_count',
        'objectives',
        'prerequisites',
        'progress_tracking',
        'completion_criteria',
        'feedback_strategy',
        'access_control',
        'published_at',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ModuleStatus::class,
            'objectives' => 'array',
            'prerequisites' => 'array',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $module): void {
            if (empty($module->uuid)) {
                $module->uuid = (string) Str::uuid();
            }
        });
    }

    protected static function newFactory(): Factory
    {
        return ModuleFactory::new();
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(ModuleLesson::class);
    }

    public function authors(): HasMany
    {
        return $this->hasMany(ModuleAuthor::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(ModuleTag::class);
    }
}
