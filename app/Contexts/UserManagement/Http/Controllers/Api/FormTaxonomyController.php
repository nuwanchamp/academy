<?php

namespace App\Contexts\UserManagement\Http\Controllers\Api;

use App\Contexts\UserManagement\Http\Requests\UpdateTaxonomyRequest;
use App\Contexts\UserManagement\Http\Resources\FormTaxonomyResource;
use App\Contexts\UserManagement\Models\FormTaxonomy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpFoundation\Response;

class FormTaxonomyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $taxonomies = FormTaxonomy::query()->orderBy('key')->get();

        return FormTaxonomyResource::collection($taxonomies);
    }

    public function update(UpdateTaxonomyRequest $request, string $taxonomyKey): JsonResponse|FormTaxonomyResource
    {
        $user = $request->user();
        if ($user?->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $taxonomy = FormTaxonomy::firstOrNew(['key' => $taxonomyKey]);
        $taxonomy->options = array_values(array_unique($request->input('options')));
        $taxonomy->updated_by = $user->id;
        $taxonomy->save();

        return new FormTaxonomyResource($taxonomy);
    }
}
