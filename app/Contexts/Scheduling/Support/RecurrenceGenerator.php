<?php

namespace App\Contexts\Scheduling\Support;

use Illuminate\Support\Carbon;

class RecurrenceGenerator
{
    /**
     * @return array<int, array{starts_at: Carbon, ends_at: Carbon}>
     */
    public function generate(Carbon $startsAt, Carbon $endsAt, ?string $frequency, int $count): array
    {
        $count = max(1, $count);
        $frequency = $frequency ?: null;

        $occurrences = [];
        for ($i = 0; $i < $count; $i++) {
            $offsetStart = $this->addInterval($startsAt, $frequency, $i);
            $offsetEnd = $this->addInterval($endsAt, $frequency, $i);

            $occurrences[] = [
                'starts_at' => $offsetStart,
                'ends_at' => $offsetEnd,
            ];
        }

        return $occurrences;
    }

    public function toRule(?string $frequency, ?int $count): ?string
    {
        if (empty($frequency)) {
            return null;
        }

        return sprintf('FREQ=%s;COUNT=%d', strtoupper($frequency), $count ?? 1);
    }

    /**
     * @return array{frequency: string|null, count: int}
     */
    public function fromRule(?string $rule): array
    {
        if (empty($rule)) {
            return ['frequency' => null, 'count' => 1];
        }

        $parts = collect(explode(';', $rule))
            ->mapWithKeys(function ($segment) {
                [$key, $value] = array_pad(explode('=', $segment, 2), 2, null);
                return [strtolower($key) => strtolower((string) $value)];
            });

        $frequency = $parts->get('freq');
        $count = (int) ($parts->get('count', 1));

        return [
            'frequency' => $frequency,
            'count' => max(1, $count),
        ];
    }

    private function addInterval(Carbon $dateTime, ?string $frequency, int $steps): Carbon
    {
        return match ($frequency) {
            'daily' => $dateTime->copy()->addDays($steps),
            'weekly' => $dateTime->copy()->addWeeks($steps),
            default => $dateTime->copy(),
        };
    }
}
