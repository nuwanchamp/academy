<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Actions\CancelEnrollmentAction;
use App\Contexts\Scheduling\Models\StudySession;
use App\Contexts\Scheduling\Models\StudySessionEnrollment;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

class DeleteEnrollmentController extends Controller
{
    public function __invoke(
        StudySession $studySession,
        StudySessionEnrollment $enrollment,
        CancelEnrollmentAction $action
    ) {
        $teacher = request()->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        if ((int) $studySession->getKey() !== (int) $enrollment->study_session_id) {
            abort(Response::HTTP_BAD_REQUEST, 'Enrollment does not belong to this session.');
        }

        $action->execute($enrollment, $teacher);

        return response()->noContent();
    }
}
