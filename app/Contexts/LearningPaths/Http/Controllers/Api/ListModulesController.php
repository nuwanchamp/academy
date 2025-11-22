<?php

namespace App\Contexts\LearningPaths\Http\Controllers\Api;

use App\Contexts\LearningPaths\Http\Resources\ModuleSummaryResource;
use App\Contexts\LearningPaths\Models\Module;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class ListModulesController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        if ($user === null) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min(50, $perPage));

        $baseQuery = Module::query()->with('tags');

        $subjectOptions = (clone $baseQuery)
            ->whereNotNull('subject')
            ->distinct()
            ->orderBy('subject')
            ->pluck('subject')
            ->filter()
            ->values()
            ->all();

        $gradeBandOptions = (clone $baseQuery)
            ->whereNotNull('grade_band')
            ->distinct()
            ->orderBy('grade_band')
            ->pluck('grade_band')
            ->filter()
            ->values()
            ->all();

        $statusOptions = (clone $baseQuery)
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->filter()
            ->values()
            ->all();

        $modulesQuery = clone $baseQuery;

        if ($request->filled('subject')) {
            $modulesQuery->where('subject', $request->string('subject'));
        }

        if ($request->filled('grade_band')) {
            $modulesQuery->where('grade_band', $request->string('grade_band'));
        }

        if ($request->filled('status')) {
            $modulesQuery->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search')->trim();
            $modulesQuery->where(function ($query) use ($term): void {
                $query->where('title', 'like', "%{$term}%")
                    ->orWhere('summary', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            });
        }

        $modules = $modulesQuery
            ->orderByDesc('updated_at')
            ->orderBy('title')
            ->paginate($perPage)
            ->withQueryString();

        return ModuleSummaryResource::collection($modules)->additional([
            'filters' => [
                'subjects' => $subjectOptions,
                'grade_bands' => $gradeBandOptions,
                'statuses' => $statusOptions,
            ],
        ]);
    }
}
