<?php

use Illuminate\Support\Facades\Route;
use App\Contexts\UserManagement\Http\Controllers\RegistrationController;

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');


Route::post('/register', [RegistrationController::class, 'store']);
Route::post('/dashboard', [RegistrationController::class, 'dashboard'])->name('home');
