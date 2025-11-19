<?php

namespace App\Contexts\StudentProfiles\Models;

use App\Contexts\StudentProfiles\Database\Factories\StudentFactory;
use App\Contexts\StudentProfiles\Enums\StudentStatus;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'preferred_name',
        'date_of_birth',
        'grade',
        'status',
        'diagnoses',
        'notes',
        'assessment_summary',
        'ieps_or_goals',
        'risk_flags',
        'teacher_id',
        'case_manager_id',
        'current_learning_path_id',
        'start_date',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => StudentStatus::class,
            'date_of_birth' => 'date',
            'start_date' => 'date',
            'diagnoses' => 'array',
            'ieps_or_goals' => 'array',
            'risk_flags' => 'array',
        ];
    }

    protected static function newFactory(): Factory
    {
        return StudentFactory::new();
    }

    public function guardians()
    {
        return $this->belongsToMany(User::class, 'guardian_student', 'student_id', 'guardian_id')
            ->withPivot(['relationship', 'is_primary', 'access_level', 'notifications_opt_in'])
            ->withTimestamps();
    }
}
