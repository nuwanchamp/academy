<?php

use App\Contexts\StudentProfiles\Http\Controllers\Api\CreateStudentController;
use App\Contexts\StudentProfiles\Http\Controllers\Api\ListStudentsController;
use App\Contexts\StudentProfiles\Http\Controllers\Api\ShowStudentController;
use App\Contexts\StudentProfiles\Http\Controllers\Api\UpdateStudentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/v1')
    ->group(function (): void {
        Route::get('students', ListStudentsController::class)
            ->name('students.index');

        Route::get('students/{student}', ShowStudentController::class)
            ->name('students.show');

        Route::patch('students/{student}', UpdateStudentController::class)
            ->name('students.update');

        Route::post('students', CreateStudentController::class)
            ->name('students.store');
    });
