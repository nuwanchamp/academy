<?php

namespace App\Contexts\Scheduling\Enums;

enum EnrollmentStatus: string
{
    case ENROLLED = 'enrolled';
    case WAITLISTED = 'waitlisted';
}
