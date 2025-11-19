<?php

namespace App\Contexts\ParentPortal\Http\Controllers\Api;

use App\Contexts\ParentPortal\Actions\CreateParentAction;
use App\Contexts\ParentPortal\Http\Requests\StoreParentRequest;
use App\Contexts\ParentPortal\Http\Resources\ParentResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CreateParentController extends Controller
{
    public function __invoke(StoreParentRequest $request, CreateParentAction $action): JsonResponse
    {
        $parentProfile = $action->execute($request->validated());

        return (new ParentResource($parentProfile))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
