<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lesson_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('module_lessons')->cascadeOnDelete();
            $table->string('name');
            $table->string('file_type')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('storage_path')->nullable();
            $table->string('external_url')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_materials');
    }
};
