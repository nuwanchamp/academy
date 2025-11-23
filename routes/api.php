<?php

use App\Contexts\UserManagement\Http\Controllers\Api\ForgotPasswordController;
use App\Contexts\UserManagement\Http\Controllers\Api\LoginController;
use App\Contexts\UserManagement\Http\Controllers\Api\LogoutController;
use App\Contexts\UserManagement\Http\Controllers\Api\RegisterController;
use App\Contexts\UserManagement\Http\Controllers\Api\ResetPasswordController;
use App\Contexts\UserManagement\Http\Controllers\Api\FormTaxonomyController;
use App\Contexts\UserManagement\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('register', RegisterController::class);
    Route::post('login', LoginController::class);
    Route::post('password/forgot', ForgotPasswordController::class);
    Route::post('password/reset', ResetPasswordController::class);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', LogoutController::class);

        Route::prefix('settings')->group(function (): void {
            Route::get('me', [SettingsController::class, 'show']);
            Route::patch('me', [SettingsController::class, 'updateProfile']);
            Route::patch('notifications', [SettingsController::class, 'updateNotifications']);
            Route::post('password', [SettingsController::class, 'updatePassword']);

            Route::get('taxonomies', [FormTaxonomyController::class, 'index']);
            Route::patch('taxonomies/{taxonomy}', [FormTaxonomyController::class, 'update']);
        });
    });
});
