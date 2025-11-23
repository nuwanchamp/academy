<?php

use App\Contexts\LearningPaths\Providers\LearningPathsServiceProvider;
use App\Contexts\ParentPortal\Providers\ParentPortalServiceProvider;
use App\Contexts\Scheduling\Providers\SchedulingServiceProvider;
use App\Contexts\StudentProfiles\Providers\StudentProfilesServiceProvider;
use App\Contexts\UserManagement\Providers\UserManagementServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
//        if (config('app.env') === 'testing') {
//            $middleware->remove(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
//        }
        $middleware->trustProxies(at: '*')
            ->trustHosts();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withProviders([
        UserManagementServiceProvider::class,
        StudentProfilesServiceProvider::class,
        LearningPathsServiceProvider::class,
        ParentPortalServiceProvider::class,
        SchedulingServiceProvider::class,
    ])->create();
