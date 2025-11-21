<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Actions\UpdateStudySessionAction;
use App\Contexts\Scheduling\Http\Requests\UpdateStudySessionRequest;
use App\Contexts\Scheduling\Http\Resources\StudySessionResource;
use App\Contexts\Scheduling\Models\StudySession;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class UpdateStudySessionController extends Controller
{
    public function __invoke(
        UpdateStudySessionRequest $request,
        StudySession $studySession,
        UpdateStudySessionAction $action
    ): StudySessionResource {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        if ((int) $studySession->teacher_id !== (int) $teacher->getKey()) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $updated = $action->execute($studySession, $request->validated(), $teacher);

        return new StudySessionResource($updated);
    }
}
