<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('paths', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('subject')->nullable();
            $table->string('grade_band')->nullable();
            $table->string('status')->default('draft');
            $table->string('visibility')->default('private');
            $table->string('pacing')->nullable();
            $table->unsignedSmallInteger('modules_count')->default(0);
            $table->json('objectives')->nullable();
            $table->json('success_metrics')->nullable();
            $table->date('planned_release_date')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paths');
    }
};
