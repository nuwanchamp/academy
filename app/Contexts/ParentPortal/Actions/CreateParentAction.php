<?php

namespace App\Contexts\ParentPortal\Actions;

use App\Contexts\ParentPortal\Models\GuardianProfile;
use App\Contexts\StudentProfiles\Models\Student;
use App\Contexts\UserManagement\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateParentAction
{
    /**
     * @param array<string, mixed> $attributes
     */
    public function execute(array $attributes): GuardianProfile
    {
        return DB::transaction(function () use ($attributes): GuardianProfile {
            $user = $this->createUser($attributes);

            $profileData = Arr::only($attributes, [
                'household_id',
                'primary_phone',
                'secondary_phone',
                'address_line1',
                'address_line2',
                'city',
                'state',
                'postal_code',
                'preferred_contact_times',
                'communication_preferences',
                'identity_verified_at',
            ]);

            $profile = GuardianProfile::create(array_merge($profileData, [
                'user_id' => $user->id,
            ]));

            $this->syncStudents($profile, $attributes['students'] ?? []);

            return $profile->load(['user', 'students']);
        });
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function createUser(array $attributes): User
    {
        $name = trim(($attributes['first_name'] ?? '').' '.($attributes['last_name'] ?? ''));

        return User::create([
            'first_name' => $attributes['first_name'] ?? null,
            'last_name' => $attributes['last_name'] ?? null,
            'name' => $name !== '' ? $name : ($attributes['email'] ?? ''),
            'email' => $attributes['email'],
            'password' => $attributes['password'] ?? Str::random(32),
            'role' => 'parent',
            'preferred_name' => $attributes['preferred_name'] ?? null,
            'phone' => $attributes['primary_phone'] ?? null,
            'invited_at' => !empty($attributes['send_portal_invite']) ? now() : null,
        ]);
    }

    /**
     * @param list<array<string, mixed>> $students
     */
    private function syncStudents(GuardianProfile $profile, array $students): void
    {
        if (empty($students)) {
            return;
        }

        $rows = [];
        $now = now();

        foreach ($students as $link) {
            /** @var Student $student */
            $student = Student::query()->findOrFail($link['id']);

            $rows[$student->id] = [
                'relationship' => $link['relationship'] ?? null,
                'is_primary' => (bool) ($link['is_primary'] ?? false),
                'access_level' => $link['access_level'] ?? 'view',
                'notifications_opt_in' => (bool) ($link['notifications_opt_in'] ?? true),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('guardian_student')->upsert(
            collect($rows)->map(function ($pivot, $studentId) use ($profile): array {
                return array_merge($pivot, [
                    'guardian_id' => $profile->user_id,
                    'student_id' => $studentId,
                ]);
            })->values()->all(),
            ['guardian_id', 'student_id'],
            ['relationship', 'is_primary', 'access_level', 'notifications_opt_in', 'updated_at']
        );
    }
}
