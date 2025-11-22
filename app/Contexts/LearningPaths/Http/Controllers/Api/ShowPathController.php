<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Http\Resources\PathResource;
use App\Contexts\LearningPaths\Models\Path;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class ShowPathController extends Controller
{
    public function __invoke(Path $path): PathResource
    {
        if (auth('sanctum')->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $path->load([
            'modules',
            'owner',
        ]);

        return new PathResource($path);
    }
}
