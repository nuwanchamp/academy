<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Http\Resources\StudySessionResource;
use App\Contexts\Scheduling\Models\StudySession;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShowStudySessionController extends Controller
{
    public function __invoke(Request $request, StudySession $studySession): StudySessionResource
    {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        if ((int) $studySession->teacher_id !== (int) $teacher->getKey()) {
            abort(Response::HTTP_FORBIDDEN);
        }

        return new StudySessionResource($studySession->load('occurrences'));
    }
}
