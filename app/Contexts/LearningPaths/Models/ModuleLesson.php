<?php

namespace App\Contexts\LearningPaths\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModuleLesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'sequence_order',
        'title',
        'summary',
        'objectives',
        'body',
        'instructions',
        'outcomes',
    ];

    protected function casts(): array
    {
        return [
            'objectives' => 'array',
            'outcomes' => 'array',
        ];
    }

    protected static function newFactory(): \Illuminate\Database\Eloquent\Factories\Factory
    {
        return \App\Contexts\LearningPaths\Database\Factories\ModuleLessonFactory::new();
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(LessonMaterial::class, 'lesson_id');
    }

    public function mediaUploads(): HasMany
    {
        return $this->hasMany(LessonMediaUpload::class, 'lesson_id');
    }
}
