<?php

namespace App\Contexts\StudentProfiles\Providers;

use Illuminate\Support\ServiceProvider;

class StudentProfilesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(app_path('Contexts/StudentProfiles/Database/Migrations'));
        $this->loadRoutesFrom(base_path('routes/student_profiles.php'));
    }
}
