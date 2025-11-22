<?php

namespace App\Contexts\LearningPaths\Enums;

enum PathVisibility: string
{
    case PRIVATE = 'private';
    case SCHOOL = 'school';
    case DISTRICT = 'district';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
