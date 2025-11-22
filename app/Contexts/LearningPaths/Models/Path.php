<?php

namespace App\Contexts\LearningPaths\Models;

use App\Contexts\LearningPaths\Database\Factories\PathFactory;
use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Path extends Model
{
    /** @use HasFactory<PathFactory> */
    use HasFactory;

    protected $fillable = [
        'uuid',
        'code',
        'title',
        'summary',
        'subject',
        'grade_band',
        'status',
        'visibility',
        'pacing',
        'modules_count',
        'objectives',
        'success_metrics',
        'planned_release_date',
        'published_at',
        'archived_at',
        'owner_user_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => PathStatus::class,
            'visibility' => PathVisibility::class,
            'objectives' => 'array',
            'success_metrics' => 'array',
            'planned_release_date' => 'date',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $path): void {
            if (empty($path->uuid)) {
                $path->uuid = (string) Str::uuid();
            }
        });
    }

    protected static function newFactory(): Factory
    {
        return PathFactory::new();
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'path_modules')
            ->withPivot('sequence_order')
            ->orderBy('path_modules.sequence_order');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }
}
