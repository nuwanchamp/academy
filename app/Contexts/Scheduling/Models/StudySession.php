<?php

namespace App\Contexts\Scheduling\Models;

use App\Contexts\Scheduling\Database\Factories\StudySessionFactory;
use App\Contexts\Scheduling\Enums\StudySessionStatus;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudySession extends Model
{
    /** @use HasFactory<StudySessionFactory> */
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'title',
        'description',
        'starts_at',
        'ends_at',
        'location',
        'meeting_url',
        'capacity',
        'timezone',
        'status',
        'recurrence_rule',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'status' => StudySessionStatus::class,
        ];
    }

    protected static function newFactory(): Factory
    {
        return StudySessionFactory::new();
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function enrollments()
    {
        return $this->hasMany(StudySessionEnrollment::class, 'study_session_id');
    }

    public function occurrences()
    {
        return $this->hasMany(StudySessionOccurrence::class, 'study_session_id')
            ->orderBy('starts_at');
    }
}
