<?php

namespace App\Contexts\UserManagement\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Contexts\ParentPortal\Models\GuardianProfile;
use App\Contexts\UserManagement\Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'preferred_name',
        'email',
        'email_verified_at',
        'phone',
        'timezone',
        'preferred_locale',
        'role',
        'is_active',
        'invited_at',
        'activated_at',
        'deactivated_at',
        'last_login_at',
        'password_updated_at',
        'password',
        'organization_id',
        'permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'invited_at' => 'datetime',
            'activated_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'password_updated_at' => 'datetime',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): UserFactory|Factory
    {
        return UserFactory::new();
    }

    public function guardianProfile()
    {
        return $this->hasOne(GuardianProfile::class, 'user_id');
    }
}
