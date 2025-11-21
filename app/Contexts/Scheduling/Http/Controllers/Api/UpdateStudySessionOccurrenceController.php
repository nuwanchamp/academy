<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Actions\UpdateStudySessionOccurrenceAction;
use App\Contexts\Scheduling\Http\Requests\UpdateStudySessionOccurrenceRequest;
use App\Contexts\Scheduling\Http\Resources\StudySessionOccurrenceResource;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionOccurrence;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class UpdateStudySessionOccurrenceController extends Controller
{
    public function __invoke(
        UpdateStudySessionOccurrenceRequest $request,
        StudySession $studySession,
        StudySessionOccurrence $occurrence,
        UpdateStudySessionOccurrenceAction $action
    ): StudySessionOccurrenceResource {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        if ((int) $studySession->teacher_id !== (int) $teacher->getKey()) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $updated = $action->execute($studySession, $occurrence, $request->validated(), $teacher);

        return new StudySessionOccurrenceResource($updated);
    }
}
