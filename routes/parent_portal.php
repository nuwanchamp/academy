<?php

use App\Contexts\ParentPortal\Http\Controllers\Api\CreateParentController;
use App\Contexts\ParentPortal\Http\Controllers\Api\ListParentsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])
    ->prefix('api/v1')
    ->group(function (): void {
        Route::post('parents', CreateParentController::class)
            ->name('parents.store');
        Route::get('parents', ListParentsController::class)
            ->name('parents.index');
    });
