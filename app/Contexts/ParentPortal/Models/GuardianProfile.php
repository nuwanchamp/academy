<?php

namespace App\Contexts\ParentPortal\Models;

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GuardianProfile extends Model
{
    protected $fillable = [
        'user_id',
        'household_id',
        'primary_phone',
        'secondary_phone',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'preferred_contact_times',
        'communication_preferences',
        'identity_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'communication_preferences' => 'array',
            'identity_verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            Student::class,
            'guardian_student',
            'guardian_id',
            'student_id',
            'user_id'
        )->withPivot(['relationship', 'is_primary', 'access_level', 'notifications_opt_in'])
            ->withTimestamps();
    }
}
