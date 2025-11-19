<?php

use App\Contexts\UserManagement\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/register', [RegistrationController::class, 'create'])
        ->name('register.form');

    Route::post('/register', [RegistrationController::class, 'store'])
        ->name('register');
});

