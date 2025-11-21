<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Actions\CreateStudySessionAction;
use App\Contexts\Scheduling\Http\Requests\StoreStudySessionRequest;
use App\Contexts\Scheduling\Http\Resources\StudySessionResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CreateStudySessionController extends Controller
{
    public function __invoke(StoreStudySessionRequest $request, CreateStudySessionAction $action): JsonResponse
    {
        $studySession = $action->execute($request->validated(), $request->user());

        return (new StudySessionResource($studySession))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
