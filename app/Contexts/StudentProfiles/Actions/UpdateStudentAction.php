<?php

namespace App\Contexts\StudentProfiles\Actions;

use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\ParentPortal\Models\GuardianProfile;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UpdateStudentAction
{
    public function execute(Student $student, array $attributes, User $updater): Student
    {
        $guardianLinks = Arr::pull($attributes, 'guardians', null);

        $student->fill($attributes);
        $student->updated_by = $updater->getKey();

        return DB::transaction(function () use ($student, $guardianLinks) {
            $student->save();

            if ($guardianLinks !== null) {
                $student->guardians()->sync($this->formatGuardianPivotData($guardianLinks));
                $this->updateGuardianProfiles($guardianLinks);
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

    /**
     * @param array<int, array<string, mixed>> $guardians
     */
    private function updateGuardianProfiles(array $guardians): void
    {
        foreach ($guardians as $data) {
            if (empty($data['id'])) {
                continue;
            }

            $guardian = User::query()->with('guardianProfile')->find($data['id']);
            if (!$guardian) {
                continue;
            }

            $userAttributes = [];
            if (array_key_exists('name', $data) && !empty($data['name'])) {
                $userAttributes['name'] = $data['name'];

                [$firstName, $lastName] = $this->splitName($data['name']);
                $userAttributes['first_name'] = $firstName;
                $userAttributes['last_name'] = $lastName;
            }

            if (!empty($data['email'])) {
                $userAttributes['email'] = $data['email'];
            }

            if (!empty($userAttributes)) {
                $guardian->fill($userAttributes);
                $guardian->save();
            }

            $profileAttributes = [];
            if (!empty($data['primary_phone'])) {
                $profileAttributes['primary_phone'] = $data['primary_phone'];
            }

            if (!empty($data['address_line1'])) {
                $profileAttributes['address_line1'] = $data['address_line1'];
            }

            if (!empty($profileAttributes)) {
                /** @var GuardianProfile $profile */
                $profile = $guardian->guardianProfile()->firstOrNew(['user_id' => $guardian->getKey()]);
                $profile->fill($profileAttributes);
                $profile->save();
            }
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2);
        $first = $parts[0] ?? $name;
        $last = $parts[1] ?? '';

        return [$first, $last];
    }
}
