<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('employee_code')->nullable();
            $table->date('hire_date')->nullable();
            $table->string('grade_band_focus')->nullable();
            $table->json('subjects')->nullable();
            $table->json('specializations')->nullable();
            $table->unsignedInteger('caseload_capacity')->nullable();
            $table->unsignedInteger('current_caseload')->default(0);
            $table->string('assigned_site')->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_photo_url')->nullable();
            $table->json('communication_preferences')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};

