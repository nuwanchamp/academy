<?php

namespace App\Contexts\StudentProfiles\Http\Controllers\Api;

use App\Contexts\StudentProfiles\Http\Resources\StudentSummaryResource;
use App\Contexts\StudentProfiles\Models\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ListStudentsController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $teacher = $request->user();

        if ($teacher === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min(50, $perPage));

        $baseQuery = Student::query()
            ->select([
                'id',
                'first_name',
                'last_name',
                'preferred_name',
                'date_of_birth',
                'grade',
                'status',
                'case_manager_id',
                'teacher_id',
            ])
            ->where(function ($query) use ($teacher): void {
                $teacherId = $teacher->getKey();
                $query->where('case_manager_id', $teacherId)
                    ->orWhere('teacher_id', $teacherId);
            });

        $gradeOptions = (clone $baseQuery)
            ->whereNotNull('grade')
            ->distinct()
            ->orderBy('grade')
            ->pluck('grade')
            ->filter()
            ->values()
            ->all();

        $studentsQuery = clone $baseQuery;

        if ($request->filled('grade')) {
            $studentsQuery->where('grade', $request->string('grade'));
        }

        if ($request->filled('status')) {
            $studentsQuery->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search')->trim();
            $studentsQuery->where(function ($query) use ($term): void {
                $query->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('preferred_name', 'like', "%{$term}%");
            });
        }

        $students = $studentsQuery
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage)
            ->withQueryString();

        return StudentSummaryResource::collection($students)->additional([
            'filters' => [
                'grades' => $gradeOptions,
            ],
        ]);
    }
}
