<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if (DB::table('students')->exists()) {
            DB::table('students')->whereNull('grade')->update(['grade' => 'Unassigned']);
            DB::table('students')->whereNull('date_of_birth')->update(['date_of_birth' => '2010-01-01']);

            if (DB::table('students')->whereNull('case_manager_id')->exists()) {
                DB::statement('UPDATE students SET case_manager_id = teacher_id WHERE case_manager_id IS NULL AND teacher_id IS NOT NULL');
                DB::statement('UPDATE students SET case_manager_id = created_by WHERE case_manager_id IS NULL AND created_by IS NOT NULL');
                DB::statement('UPDATE students SET case_manager_id = updated_by WHERE case_manager_id IS NULL AND updated_by IS NOT NULL');

                if (DB::table('students')->whereNull('case_manager_id')->exists()) {
                    $fallbackUserId = DB::table('users')
                        ->where('email', 'system-case-manager@example.com')
                        ->value('id');

                    if (!$fallbackUserId) {
                        $fallbackUserId = DB::table('users')->insertGetId([
                            'name' => 'System Case Manager',
                            'email' => 'system-case-manager@example.com',
                            'password' => Hash::make(Str::random(32)),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    DB::table('students')->whereNull('case_manager_id')->update(['case_manager_id' => $fallbackUserId]);
                }
            }
        }

        if ($driver !== 'sqlite') {
            DB::statement('ALTER TABLE students ALTER COLUMN grade SET NOT NULL');
            DB::statement('ALTER TABLE students ALTER COLUMN date_of_birth SET NOT NULL');
            DB::statement('ALTER TABLE students ALTER COLUMN case_manager_id SET NOT NULL');
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE students ALTER COLUMN grade DROP NOT NULL');
            DB::statement('ALTER TABLE students ALTER COLUMN date_of_birth DROP NOT NULL');
            DB::statement('ALTER TABLE students ALTER COLUMN case_manager_id DROP NOT NULL');
        }
    }
};
