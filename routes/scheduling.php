<?php

use App\Contexts\Scheduling\Http\Controllers\Api\CreateStudySessionController;
use App\Contexts\Scheduling\Http\Controllers\Api\DeleteEnrollmentController;
use App\Contexts\Scheduling\Http\Controllers\Api\EnrollStudentController;
use App\Contexts\Scheduling\Http\Controllers\Api\ListStudySessionsController;
use App\Contexts\Scheduling\Http\Controllers\Api\ShowStudySessionController;
use App\Contexts\Scheduling\Http\Controllers\Api\UpdateStudySessionController;
use App\Contexts\Scheduling\Http\Controllers\Api\UpdateStudySessionOccurrenceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/v1')
    ->group(function (): void {
        Route::get('study-sessions', ListStudySessionsController::class)
            ->name('study_sessions.index');

        Route::get('study-sessions/{studySession}', ShowStudySessionController::class)
            ->name('study_sessions.show');

        Route::post('study-sessions', CreateStudySessionController::class)
            ->name('study_sessions.store');

        Route::patch('study-sessions/{studySession}', UpdateStudySessionController::class)
            ->name('study_sessions.update');

        Route::patch('study-sessions/{studySession}/occurrences/{occurrence}', UpdateStudySessionOccurrenceController::class)
            ->name('study_sessions.occurrences.update');

        Route::post('study-sessions/{studySession}/enrollments', EnrollStudentController::class)
            ->name('study_sessions.enrollments.store');

        Route::delete('study-sessions/{studySession}/enrollments/{enrollment}', DeleteEnrollmentController::class)
            ->name('study_sessions.enrollments.destroy');
    });
