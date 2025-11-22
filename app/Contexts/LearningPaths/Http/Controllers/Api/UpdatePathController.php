<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Actions\UpdatePathAction;
use App\Contexts\LearningPaths\Http\Requests\UpdatePathRequest;
use App\Contexts\LearningPaths\Http\Resources\PathResource;
use App\Contexts\LearningPaths\Models\Path;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class UpdatePathController extends Controller
{
    public function __construct(private readonly UpdatePathAction $updatePathAction)
    {
    }

    public function __invoke(UpdatePathRequest $request, Path $path): PathResource
    {
        if ($request->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $updated = $this->updatePathAction->execute($path, $request->payload());

        return new PathResource($updated);
    }
}
