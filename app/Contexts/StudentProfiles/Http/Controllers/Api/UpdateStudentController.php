<?php

namespace App\Contexts\StudentProfiles\Http\Controllers\Api;

use App\Contexts\StudentProfiles\Actions\UpdateStudentAction;
use App\Contexts\StudentProfiles\Http\Requests\UpdateStudentRequest;
use App\Contexts\StudentProfiles\Http\Resources\StudentResource;
use App\Contexts\StudentProfiles\Models\Student;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class UpdateStudentController extends Controller
{
    public function __invoke(
        UpdateStudentRequest $request,
        Student $student,
        UpdateStudentAction $action
    ): StudentResource {
        $user = $request->user();

        if ($user === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $teacherId = $user->getKey();
        $isAuthorized = $student->case_manager_id === $teacherId || $student->teacher_id === $teacherId;

        if (!$isAuthorized) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $updatedStudent = $action->execute($student, $request->validated(), $user);

        return new StudentResource($updatedStudent);
    }
}
