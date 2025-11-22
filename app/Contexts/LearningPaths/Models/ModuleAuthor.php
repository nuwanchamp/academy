<?php

namespace App\Contexts\LearningPaths\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleAuthor extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'name',
        'role',
        'bio',
        'contact_links',
    ];

    protected function casts(): array
    {
        return [
            'contact_links' => 'array',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
