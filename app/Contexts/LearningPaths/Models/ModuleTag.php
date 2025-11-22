<?php

namespace App\Contexts\LearningPaths\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'name',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
