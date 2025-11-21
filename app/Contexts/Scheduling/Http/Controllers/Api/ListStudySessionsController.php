<?php

namespace App\Contexts\Scheduling\Http\Controllers\Api;

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use App\Contexts\Scheduling\Http\Resources\StudySessionResource;
use App\Contexts\Scheduling\Models\StudySession;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ListStudySessionsController extends Controller
{
    public function __invoke(Request $request)
    {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $studySessions = StudySession::query()
            ->where('teacher_id', $teacher->getKey())
            ->withCount([
                'enrollments as enrolled_count' => fn ($query) => $query->where('status', EnrollmentStatus::ENROLLED),
                'enrollments as waitlist_count' => fn ($query) => $query->where('status', EnrollmentStatus::WAITLISTED),
            ])
            ->with('occurrences')
            ->orderBy('starts_at')
            ->get();

        return StudySessionResource::collection($studySessions);
    }
}
