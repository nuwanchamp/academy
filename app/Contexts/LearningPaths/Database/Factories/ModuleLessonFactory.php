<?php

namespace App\Contexts\LearningPaths\Database\Factories;

use App\Contexts\LearningPaths\Models\Module;
use App\Contexts\LearningPaths\Models\ModuleLesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ModuleLesson>
 */
class ModuleLessonFactory extends Factory
{
    protected $model = ModuleLesson::class;

    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'sequence_order' => $this->faker->numberBetween(1, 10),
            'title' => $this->faker->sentence(4),
            'summary' => $this->faker->paragraph(),
            'objectives' => $this->faker->sentences(2),
            'body' => $this->faker->paragraphs(2, true),
            'instructions' => $this->faker->paragraph(),
            'outcomes' => $this->faker->sentences(2),
        ];
    }
}
