<?php

use App\Contexts\Scheduling\Enums\StudySessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_session_occurrences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('study_session_id')->constrained('study_sessions')->cascadeOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('status')->default(StudySessionStatus::SCHEDULED->value);
            $table->timestamps();

            $table->index(['study_session_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_session_occurrences');
    }
};
