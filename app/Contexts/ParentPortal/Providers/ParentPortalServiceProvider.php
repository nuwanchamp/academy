<?php

namespace App\Contexts\ParentPortal\Providers;

use Illuminate\Support\ServiceProvider;

class ParentPortalServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(base_path('routes/parent_portal.php'));
    }
}
