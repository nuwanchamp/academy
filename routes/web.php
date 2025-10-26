<?php

use Illuminate\Support\Facades\Route;
use App\Contexts\UserManagement\Http\Controllers\RegistrationController;

Route::get('/{any}', function () {
    return view('landing');
})->where('any', '.*');

