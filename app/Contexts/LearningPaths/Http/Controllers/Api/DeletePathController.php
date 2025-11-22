<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Models\Path;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class DeletePathController extends Controller
{
    public function __invoke(Path $path)
    {
        if (auth('sanctum')->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $path->delete();

        return response()->noContent();
    }
}
