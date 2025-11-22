<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Actions\UpdateModuleAction;
use App\Contexts\LearningPaths\Http\Requests\UpdateModuleRequest;
use App\Contexts\LearningPaths\Http\Resources\ModuleResource;
use App\Contexts\LearningPaths\Models\Module;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class UpdateModuleController extends Controller
{
    public function __construct(private readonly UpdateModuleAction $updateModuleAction)
    {
    }

    public function __invoke(UpdateModuleRequest $request, Module $module): ModuleResource
    {
        if ($request->user() === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $updated = $this->updateModuleAction->execute($module, $request->payload());

        return new ModuleResource($updated);
    }
}
