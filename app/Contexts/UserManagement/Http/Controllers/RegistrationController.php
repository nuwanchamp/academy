<?php

namespace App\Contexts\UserManagement\Http\Controllers;

use App\Contexts\UserManagement\Actions\RegisterUserAction;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;

class RegistrationController
{
    public function __construct(private readonly RegisterUserAction $registerUser)
    {
    }

    public function create(): View
    {
        return view('landing');
    }

    public function store(Request $request): Redirector|RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = ($this->registerUser)($validated);

        auth()->login($user);

        return redirect('/home');
    }
    public function dashboard(Request $request){
        return redirect('/home');
    }
}
