<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('subject')->nullable();
            $table->string('grade_band')->nullable();
            $table->string('status')->default('draft');
            $table->string('version_label')->nullable();
            $table->string('difficulty')->nullable();
            $table->string('estimated_duration')->nullable();
            $table->string('learning_type')->nullable();
            $table->unsignedSmallInteger('lessons_count')->default(0);
            $table->json('objectives')->nullable();
            $table->json('prerequisites')->nullable();
            $table->text('progress_tracking')->nullable();
            $table->text('completion_criteria')->nullable();
            $table->text('feedback_strategy')->nullable();
            $table->text('access_control')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
