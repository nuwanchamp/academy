<?php

namespace App\Contexts\LearningPaths\Actions;

use App\Contexts\LearningPaths\Models\Module;
use App\Contexts\LearningPaths\Models\Path;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdatePathAction
{
    public function execute(Path $path, array $payload): Path
    {
        $modules = Arr::pull($payload, 'modules', []);

        /** @var Path $updated */
        $updated = DB::transaction(function () use ($path, $payload, $modules) {
            $path->fill($payload);
            $path->save();

            $this->syncModules($path, $modules);
            $path->update(['modules_count' => $path->modules()->count()]);

            return $path->load('modules');
        });

        return $updated;
    }

    private function syncModules(Path $path, array $modules): void
    {
        if (empty($modules)) {
            $path->modules()->detach();
            return;
        }

        $modulePayloads = collect($modules)
            ->map(function ($module, int $index) {
                if (is_array($module)) {
                    $moduleId = $module['id'] ?? $module['module_id'] ?? null;
                    $sequence = $module['sequence_order'] ?? $module['order'] ?? $index + 1;
                } else {
                    $moduleId = $module;
                    $sequence = $index + 1;
                }

                return [
                    'module_id' => $moduleId,
                    'sequence_order' => $sequence,
                ];
            })
            ->filter(fn ($module) => $module['module_id'] !== null)
            ->unique('module_id')
            ->values();

        $existingIds = Module::query()
            ->whereIn('id', $modulePayloads->pluck('module_id'))
            ->pluck('id')
            ->all();

        $sync = [];
        foreach ($modulePayloads as $payload) {
            if (in_array($payload['module_id'], $existingIds, true)) {
                $sync[$payload['module_id']] = ['sequence_order' => $payload['sequence_order']];
            }
        }

        $path->modules()->sync($sync);
    }
}
