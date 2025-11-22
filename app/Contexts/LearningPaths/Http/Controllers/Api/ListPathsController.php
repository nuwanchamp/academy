<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Http\Resources\PathSummaryResource;
use App\Contexts\LearningPaths\Models\Path;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ListPathsController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        if ($user === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min(50, $perPage));

        $baseQuery = Path::query();

        $subjects = (clone $baseQuery)
            ->whereNotNull('subject')
            ->distinct()
            ->orderBy('subject')
            ->pluck('subject')
            ->filter()
            ->values()
            ->all();

        $gradeBands = (clone $baseQuery)
            ->whereNotNull('grade_band')
            ->distinct()
            ->orderBy('grade_band')
            ->pluck('grade_band')
            ->filter()
            ->values()
            ->all();

        $statuses = (clone $baseQuery)
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->filter()
            ->values()
            ->all();

        $visibilities = (clone $baseQuery)
            ->whereNotNull('visibility')
            ->distinct()
            ->orderBy('visibility')
            ->pluck('visibility')
            ->filter()
            ->values()
            ->all();

        $pathsQuery = clone $baseQuery;

        if ($request->filled('subject')) {
            $pathsQuery->where('subject', $request->string('subject'));
        }

        if ($request->filled('grade_band')) {
            $pathsQuery->where('grade_band', $request->string('grade_band'));
        }

        if ($request->filled('status')) {
            $pathsQuery->where('status', $request->string('status'));
        }

        if ($request->filled('visibility')) {
            $pathsQuery->where('visibility', $request->string('visibility'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search')->trim();
            $pathsQuery->where(function ($query) use ($term): void {
                $query->where('title', 'like', "%{$term}%")
                    ->orWhere('summary', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            });
        }

        $paths = $pathsQuery
            ->orderByDesc('updated_at')
            ->orderBy('title')
            ->paginate($perPage)
            ->withQueryString();

        return PathSummaryResource::collection($paths)->additional([
            'filters' => [
                'subjects' => $subjects,
                'grade_bands' => $gradeBands,
                'statuses' => $statuses,
                'visibilities' => $visibilities,
            ],
        ]);
    }
}
