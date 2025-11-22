<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Actions\CreateModuleAction;
use App\Contexts\LearningPaths\Http\Requests\StoreModuleRequest;
use App\Contexts\LearningPaths\Http\Resources\ModuleResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class StoreModuleController extends Controller
{
    public function __construct(private readonly CreateModuleAction $createModuleAction)
    {
    }

    public function __invoke(StoreModuleRequest $request): JsonResponse
    {
        $module = $this->createModuleAction->execute($request->payload());

        return (new ModuleResource($module))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
