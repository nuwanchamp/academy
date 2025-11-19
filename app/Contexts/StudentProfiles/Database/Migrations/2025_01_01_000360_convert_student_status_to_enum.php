<?php

use App\Contexts\StudentProfiles\Enums\StudentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            $values = implode("','", StudentStatus::values());

            DB::statement(<<<SQL
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_status') THEN
                        CREATE TYPE student_status AS ENUM ('{$values}');
                    END IF;
                END$$;
                SQL);

            DB::statement("ALTER TABLE students ALTER COLUMN status DROP DEFAULT");
            DB::statement("ALTER TABLE students ALTER COLUMN status TYPE student_status USING status::text::student_status");
            DB::statement("ALTER TABLE students ALTER COLUMN status SET DEFAULT '".StudentStatus::ONBOARDING->value."'");
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE students ALTER COLUMN status DROP DEFAULT");
            DB::statement("ALTER TABLE students ALTER COLUMN status TYPE VARCHAR(32)");
            DB::statement("DROP TYPE IF EXISTS student_status");
        }
    }
};
