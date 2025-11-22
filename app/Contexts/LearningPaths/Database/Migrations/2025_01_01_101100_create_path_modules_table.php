<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('path_modules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('path_id')->constrained('paths')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->unsignedInteger('sequence_order')->default(1);
            $table->timestamps();

            $table->unique(['path_id', 'module_id']);
            $table->index(['path_id', 'sequence_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('path_modules');
    }
};
