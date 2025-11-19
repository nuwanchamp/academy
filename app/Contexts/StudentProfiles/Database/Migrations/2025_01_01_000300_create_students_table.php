<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('preferred_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('grade')->nullable();
            $table->string('status')->default('onboarding');
            $table->json('diagnoses')->nullable();
            $table->text('notes')->nullable();
            $table->text('assessment_summary')->nullable();
            $table->json('ieps_or_goals')->nullable();
            $table->json('risk_flags')->nullable();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('case_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('current_learning_path_id')->nullable();
            $table->date('start_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

