<?php

namespace App\Contexts\UserManagement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'timezone',
        'preferred_locale',
        'notifications',
        'login_alerts',
        'last_password_change_at',
    ];

    protected $casts = [
        'notifications' => 'array',
        'login_alerts' => 'boolean',
        'last_password_change_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
