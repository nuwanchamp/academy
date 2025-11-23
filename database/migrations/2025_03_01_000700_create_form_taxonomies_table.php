<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_taxonomies', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->json('options')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        DB::table('form_taxonomies')->insert([
            [
                'key' => 'student_diagnoses',
                'options' => json_encode(['OCD', 'ADHD', 'Downs Syndrome', 'LCD', 'ABCD']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'student_evaluations',
                'options' => json_encode([
                    'Student can write without a teacher',
                    'Student can read independently',
                    'Student can write with guided lines',
                    'Student can follow multi-step instructions',
                    'Student demonstrates self-regulation',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'module_subjects',
                'options' => json_encode(['Mathematics', 'Science', 'Language Arts', 'Social Studies', 'Arts']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'module_grade_bands',
                'options' => json_encode(['Grade 3', 'Grade 4', 'Grade 5', 'Middle School', 'High School']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('form_taxonomies');
    }
};
