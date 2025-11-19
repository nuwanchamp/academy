<?php

namespace App\Contexts\UserManagement\Providers;

use Illuminate\Support\ServiceProvider;

class UserManagementServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(app_path('Contexts/UserManagement/Database/Migrations'));

        $this->loadRoutesFrom(base_path('routes/user_management.php'));
    }
}
