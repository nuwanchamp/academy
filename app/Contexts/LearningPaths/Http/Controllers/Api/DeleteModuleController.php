<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Models\Module;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class DeleteModuleController extends Controller
{
    public function __invoke(Module $module)
    {
        if (auth('sanctum')->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $module->delete();

        return response()->noContent();
    }
}
