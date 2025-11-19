<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('module_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->unsignedInteger('sequence_order')->default(1);
            $table->string('title');
            $table->text('summary')->nullable();
            $table->json('objectives')->nullable();
            $table->longText('body')->nullable();
            $table->json('outcomes')->nullable();
            $table->timestamps();

            $table->index(['module_id', 'sequence_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_lessons');
    }
};
