<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Actions\LogoutUserAction;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Http\Request;

class LogoutController
{
    public function __construct(private readonly LogoutUserAction $logoutUser)
    {
    }

    public function __invoke(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        ($this->logoutUser)($user);

        return response()->noContent();
    }
}

