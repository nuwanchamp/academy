<?php

namespace App\Contexts\LearningPaths\Providers;

use Illuminate\Support\ServiceProvider;

class LearningPathsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(app_path('Contexts/LearningPaths/Database/Migrations'));
    }
}
