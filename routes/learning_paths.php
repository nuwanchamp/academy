<?php

use App\Contexts\LearningPaths\Http\Controllers\Api\ListModulesController;
use App\Contexts\LearningPaths\Http\Controllers\Api\ShowModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\StoreModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\UpdateModuleController;
use App\Contexts\LearningPaths\Http\Controllers\Api\DeleteModuleController;
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
    });
