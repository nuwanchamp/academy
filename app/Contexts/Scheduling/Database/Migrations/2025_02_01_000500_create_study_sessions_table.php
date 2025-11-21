<?php

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('location')->nullable();
            $table->string('meeting_url')->nullable();
            $table->unsignedInteger('capacity')->default(1);
            $table->string('timezone')->default('UTC');
            $table->string('recurrence_rule')->nullable();
            $table->string('status')->default(StudySessionStatus::SCHEDULED->value);
            $table->timestamps();

            $table->index(['teacher_id', 'starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_sessions');
    }
};
