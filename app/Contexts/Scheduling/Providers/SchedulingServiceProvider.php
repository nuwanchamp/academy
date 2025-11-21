<?php

namespace App\Contexts\Scheduling\Providers;

use Illuminate\Support\ServiceProvider;

class SchedulingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(app_path('Contexts/Scheduling/Database/Migrations'));
        $this->loadRoutesFrom(base_path('routes/scheduling.php'));
    }
}
