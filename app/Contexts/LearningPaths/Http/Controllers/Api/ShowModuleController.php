<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Http\Resources\ModuleResource;
use App\Contexts\LearningPaths\Models\Module;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class ShowModuleController extends Controller
{
    public function __invoke(Module $module): ModuleResource
    {
        if (auth('sanctum')->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $module->load([
            'tags',
            'authors',
            'lessons.materials',
            'lessons.mediaUploads',
        ]);

        return new ModuleResource($module);
    }
}
