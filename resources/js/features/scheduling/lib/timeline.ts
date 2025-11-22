import {cn} from "@/lib/utils.ts";

export type TimelineEvent = {
    starts_at: string;
    ends_at: string;
};

export type TimelineConfig = {
    fallbackStart?: number;
    fallbackEnd?: number;
    paddingMinutes?: number;
};

export type TimelineShape = {
    startMinutes: number;
    totalMinutes: number;
    hours: number[];
};

export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));

export const toMinutes = (value: string) => {
    const parsed = new Date(value.replace(" ", "T"));
    return parsed.getHours() * 60 + parsed.getMinutes();
};

export const formatTimeRange = (start: string, end: string) => {
    const formatter = new Intl.DateTimeFormat(undefined, {hour: "2-digit", minute: "2-digit"});
    const s = new Date(start.replace(" ", "T"));
    const e = new Date(end.replace(" ", "T"));
    return `${formatter.format(s)} – ${formatter.format(e)}`;
};

export function deriveTimeline(events: TimelineEvent[], config?: TimelineConfig): TimelineShape {
    const fallbackStart = config?.fallbackStart ?? 8 * 60;
    const fallbackEnd = config?.fallbackEnd ?? 18 * 60;
    const padding = config?.paddingMinutes ?? 60;
    if (events.length === 0) {
        const start = fallbackStart - padding;
        const end = fallbackEnd + padding;
        const startHour = Math.floor(start / 60);
        const endHour = Math.ceil(end / 60);
        return {
            startMinutes: start,
            totalMinutes: end - start,
            hours: Array.from({length: endHour - startHour + 1}, (_, idx) => startHour + idx),
        };
    }
    const minStart = Math.min(...events.map((e) => toMinutes(e.starts_at)));
    const maxEnd = Math.max(...events.map((e) => toMinutes(e.ends_at)));
    const start = Math.min(fallbackStart, Math.floor(minStart / 60) * 60) - padding;
    const end = Math.max(fallbackEnd, Math.ceil(maxEnd / 60) * 60) + padding;
    const startHour = Math.floor(start / 60);
    const endHour = Math.ceil(end / 60);
    return {
        startMinutes: start,
        totalMinutes: end - start,
        hours: Array.from({length: endHour - startHour + 1}, (_, idx) => startHour + idx),
    };
}
