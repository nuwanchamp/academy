<?php

namespace App\Contexts\Scheduling\Models;

use App\Contexts\Scheduling\Database\Factories\StudySessionOccurrenceFactory;
use App\Contexts\Scheduling\Enums\StudySessionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudySessionOccurrence extends Model
{
    /** @use HasFactory<StudySessionOccurrenceFactory> */
    use HasFactory;

    protected $fillable = [
        'study_session_id',
        'starts_at',
        'ends_at',
        'status',
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
        return StudySessionOccurrenceFactory::new();
    }

    public function session()
    {
        return $this->belongsTo(StudySession::class, 'study_session_id');
    }
}
