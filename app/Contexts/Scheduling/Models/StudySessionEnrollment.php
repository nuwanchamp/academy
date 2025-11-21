<?php

namespace App\Contexts\Scheduling\Models;

use App\Contexts\Scheduling\Database\Factories\StudySessionEnrollmentFactory;
use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\StudentProfiles\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudySessionEnrollment extends Model
{
    /** @use HasFactory<StudySessionEnrollmentFactory> */
    use HasFactory;

    protected $fillable = [
        'study_session_id',
        'student_id',
        'status',
        'waitlist_position',
    ];

    protected $table = 'study_session_enrollments';

    protected function casts(): array
    {
        return [
            'status' => EnrollmentStatus::class,
        ];
    }

    protected static function newFactory(): Factory
    {
        return StudySessionEnrollmentFactory::new();
    }

    public function session()
    {
        return $this->belongsTo(StudySession::class, 'study_session_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
