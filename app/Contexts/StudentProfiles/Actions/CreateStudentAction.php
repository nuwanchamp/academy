<?php

namespace App\Contexts\StudentProfiles\Actions;

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateStudentAction
{
    public function execute(array $attributes, User $creator): Student
    {
        $guardianLinks = Arr::pull($attributes, 'guardians', []);

        $data = array_merge($attributes, [
            'created_by' => $creator->getKey(),
            'updated_by' => $creator->getKey(),
        ]);

        return DB::transaction(function () use ($data, $guardianLinks) {
            /** @var Student $student */
            $student = Student::create($data);

            if (!empty($guardianLinks)) {
                $student->guardians()->sync($this->formatGuardianPivotData($guardianLinks));
            }

            return $student->load('guardians.guardianProfile');
        });
    }

    /**
     * @param array<int, array<string, mixed>> $guardians
     * @return array<int, array<string, mixed>>
     */
    private function formatGuardianPivotData(array $guardians): array
    {
        $pivot = [];
        foreach ($guardians as $link) {
            if (empty($link['id'])) {
                continue;
            }

            $pivot[(int) $link['id']] = [
                'relationship' => $link['relationship'] ?? null,
                'is_primary' => (bool) ($link['is_primary'] ?? false),
                'access_level' => $link['access_level'] ?? 'view',
                'notifications_opt_in' => (bool) ($link['notifications_opt_in'] ?? true),
            ];
        }

        return $pivot;
    }
}
