<?php

namespace App\Contexts\StudentProfiles\Http\Controllers\Api;

use App\Contexts\StudentProfiles\Http\Resources\StudentResource;
use App\Contexts\StudentProfiles\Models\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShowStudentController extends Controller
{
    public function __invoke(Request $request, Student $student): StudentResource
    {
        $user = $request->user();

        if ($user === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $teacherId = $user->getKey();
        $isAuthorized = $student->case_manager_id === $teacherId || $student->teacher_id === $teacherId;

        if (!$isAuthorized) {
            abort(Response::HTTP_FORBIDDEN);
        }

        return new StudentResource($student->load('guardians.guardianProfile'));
    }
}
