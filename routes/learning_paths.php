<?php

use App\Contexts\LearningPaths\Http\Controllers\Api\ListModulesController;
use App\Contexts\LearningPaths\Http\Controllers\Api\ShowModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\StoreModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\UpdateModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\DeleteModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\ListPathsController;
use App\Contexts\LearningPaths\Http\Controllers\Api\ShowPathController;
use App\Contexts\LearningPaths\Http\Controllers\Api\StorePathController;
use App\Contexts\LearningPaths\Http\Controllers\Api\UpdatePathController;
use App\Contexts\LearningPaths\Http\Controllers\Api\DeletePathController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/v1')
    ->group(function (): void {
        Route::get('modules', ListModulesController::class)
            ->name('modules.index');

        Route::get('modules/{module}', ShowModuleController::class)
            ->name('modules.show');

        Route::post('modules', StoreModuleController::class)
            ->name('modules.store');

        Route::patch('modules/{module}', UpdateModuleController::class)
            ->name('modules.update');

        Route::delete('modules/{module}', DeleteModuleController::class)
            ->name('modules.destroy');

        Route::get('paths', ListPathsController::class)
            ->name('paths.index');

        Route::get('paths/{path}', ShowPathController::class)
            ->name('paths.show');

        Route::post('paths', StorePathController::class)
            ->name('paths.store');

        Route::patch('paths/{path}', UpdatePathController::class)
            ->name('paths.update');

        Route::delete('paths/{path}', DeletePathController::class)
            ->name('paths.destroy');
    });
