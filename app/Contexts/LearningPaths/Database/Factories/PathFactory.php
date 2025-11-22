<?php

namespace App\Contexts\LearningPaths\Database\Factories;

use App\Contexts\LearningPaths\Enums\PathStatus;
use App\Contexts\LearningPaths\Enums\PathVisibility;
use App\Contexts\LearningPaths\Models\Path;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Path>
 */
class PathFactory extends Factory
{
    protected $model = Path::class;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'code' => strtoupper('PATH-'.$this->faker->bothify('???-###')),
            'title' => $this->faker->sentence(3),
            'summary' => $this->faker->paragraph(),
            'subject' => $this->faker->randomElement(['Mathematics', 'Science', 'Literacy', 'Humanities']),
            'grade_band' => $this->faker->randomElement(['Grades K – 2', 'Grades 3 – 5', 'Grades 6 – 8']),
            'status' => $this->faker->randomElement(PathStatus::values()),
            'visibility' => $this->faker->randomElement(PathVisibility::values()),
            'pacing' => $this->faker->randomElement(['4 weeks', '6 weeks', '8 weeks']),
            'modules_count' => $this->faker->numberBetween(0, 6),
            'objectives' => $this->faker->sentences(2),
            'success_metrics' => $this->faker->sentences(2),
            'planned_release_date' => $this->faker->dateTimeBetween('+1 week', '+1 month'),
        ];
    }
}
