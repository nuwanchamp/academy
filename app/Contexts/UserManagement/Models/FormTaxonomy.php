<?php

namespace App\Contexts\UserManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormTaxonomy extends Model
{
    protected $fillable = [
        'key',
        'options',
        'updated_by',
    ];

    protected $casts = [
        'options' => 'array',
    ];

    public function getRouteKeyName(): string
    {
        return 'key';
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
