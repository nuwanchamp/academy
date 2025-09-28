<?php

use Illuminate\Support\Facades\Route;
use App\Contexts\UserManagement\Http\Controllers\RegistrationController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/register', [RegistrationController::class, 'create'])->name('register');
Route::post('/register', [RegistrationController::class, 'store']);