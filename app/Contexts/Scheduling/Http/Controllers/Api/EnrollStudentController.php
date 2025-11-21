<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Actions\EnrollStudentInStudySessionAction;
use App\Contexts\Scheduling\Http\Requests\EnrollStudentRequest;
use App\Contexts\Scheduling\Http\Resources\StudySessionEnrollmentResource;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\StudentProfiles\Models\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class EnrollStudentController extends Controller
{
    public function __invoke(
        EnrollStudentRequest $request,
        StudySession $studySession,
        EnrollStudentInStudySessionAction $action
    ): JsonResponse {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $student = Student::findOrFail($request->integer('student_id'));

        $enrollment = $action->execute($studySession, $student, $teacher);

        return (new StudySessionEnrollmentResource($enrollment))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
