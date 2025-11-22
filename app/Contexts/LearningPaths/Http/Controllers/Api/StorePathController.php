<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Actions\CreatePathAction;
use App\Contexts\LearningPaths\Http\Requests\StorePathRequest;
use App\Contexts\LearningPaths\Http\Resources\PathResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class StorePathController extends Controller
{
    public function __construct(private readonly CreatePathAction $createPathAction)
    {
    }

    public function __invoke(StorePathRequest $request): JsonResponse
    {
        $path = $this->createPathAction->execute($request->payload());

        return (new PathResource($path))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
