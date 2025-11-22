<?php

namespace App\Contexts\LearningPaths\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonMediaUpload extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'file_name',
        'storage_path',
        'mime_type',
        'file_size_bytes',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(ModuleLesson::class, 'lesson_id');
    }
}
