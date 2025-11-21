<?php

namespace App\Contexts\Scheduling\Enums;

enum StudySessionStatus: string
{
    case SCHEDULED = 'scheduled';
    case CANCELLED = 'cancelled';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
