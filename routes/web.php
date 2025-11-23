<?php

use Illuminate\Support\Facades\Route;

Route::view('/{any?}', 'landing')->where('any', '.*');
