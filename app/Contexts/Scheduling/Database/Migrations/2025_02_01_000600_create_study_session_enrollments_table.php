<?php

use App\Contexts\Scheduling\Enums\EnrollmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_session_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('study_session_id')->constrained('study_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('status')->default(EnrollmentStatus::ENROLLED->value);
            $table->unsignedInteger('waitlist_position')->nullable();
            $table->timestamps();

            $table->unique(['study_session_id', 'student_id']);
            $table->index(['study_session_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_session_enrollments');
    }
};
