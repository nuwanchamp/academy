<?php

namespace App\Contexts\UserManagement\Actions;

use App\Contexts\UserManagement\Models\User;

class LogoutUserAction
{
    public function __invoke(User $user, bool $allSessions = false): void
    {
        if ($allSessions) {
            $user->tokens()->delete();

            return;
        }

        $token = $user->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }
    }
}

