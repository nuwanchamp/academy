<?php

namespace App\Contexts\StudentProfiles\Enums;

enum StudentStatus: string
{
    case ONBOARDING = 'onboarding';
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
