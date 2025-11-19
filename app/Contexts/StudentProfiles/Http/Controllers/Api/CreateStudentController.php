<?php

namespace App\Contexts\StudentProfiles\Http\Controllers\Api;

use App\Contexts\StudentProfiles\Actions\CreateStudentAction;
use App\Contexts\StudentProfiles\Http\Requests\StoreStudentRequest;
use App\Contexts\StudentProfiles\Http\Resources\StudentResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CreateStudentController extends Controller
{
    public function __invoke(StoreStudentRequest $request, CreateStudentAction $action): JsonResponse
    {
        $student = $action->execute($request->validated(), $request->user());

        return (new StudentResource($student))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
