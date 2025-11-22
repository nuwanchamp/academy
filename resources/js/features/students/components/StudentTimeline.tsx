import {CalendarClock, MapPin} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {clamp, deriveTimeline, formatTimeRange, toMinutes} from "@/features/scheduling/lib/timeline.ts";

type TimelineOccurrence = {
    session: {title: string; location?: string | null};
    starts_at: string;
    ends_at: string;
};

type TimelineProps = {
    occurrences: TimelineOccurrence[];
    selectedDate: Date;
};

export function StudentTimeline({occurrences, selectedDate}: TimelineProps) {
    const timeline = deriveTimeline(occurrences);
    const palette = ["bg-primary/10 border-primary/30", "bg-emerald-100/70 border-emerald-200", "bg-amber-100/70 border-amber-200", "bg-sky-100/70 border-sky-200", "bg-rose-100/70 border-rose-200"];

    const isToday = new Date().toDateString() === selectedDate.toDateString();
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const shadedPct = clamp(0, ((nowMinutes - timeline.startMinutes) / timeline.totalMinutes) * 100, 100);

    return (
        <div className="grid grid-cols-[70px_1fr_70px] h-[820px] bg-muted/30 rounded-lg border overflow-hidden py-6">
            <div className="relative border-r bg-card/40">
                {timeline.hours.map((hour) => (
                    <div
                        key={`left-${hour}`}
                        className="absolute inset-x-0 border-t border-muted-foreground/20"
                        style={{top: `${((hour * 60 - timeline.startMinutes) / timeline.totalMinutes) * 100}%`}}
                    >
                        <span className="absolute left-2 -translate-y-1/2 text-xs text-muted-foreground">
                            {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                        </span>
                    </div>
                ))}
            </div>
            <div className="relative">
                {timeline.hours.map((hour) => (
                    <div
                        key={`line-${hour}`}
                        className="absolute inset-x-0 border-t border-muted-foreground/15"
                        style={{top: `${((hour * 60 - timeline.startMinutes) / timeline.totalMinutes) * 100}%`}}
                    />
                ))}
                {isToday && (
                    <>
                        <div className="absolute inset-x-0 top-0 bg-muted/60" style={{height: `${shadedPct}%`}} />
                        <div className="absolute inset-x-0 border-t border-primary/60" style={{top: `${shadedPct}%`}}>
                            <span className="absolute left-2 -translate-y-1/2 text-[11px] text-primary font-semibold bg-card px-1 rounded-sm">
                                Now
                            </span>
                        </div>
                    </>
                )}
                {occurrences.map((occurrence, idx) => {
                    const start = clamp(0, toMinutes(occurrence.starts_at) - timeline.startMinutes, timeline.totalMinutes);
                    const end = clamp(0, toMinutes(occurrence.ends_at) - timeline.startMinutes, timeline.totalMinutes);
                    const minBlockPct = (48 / timeline.totalMinutes) * 100;
                    const height = Math.max(end - start, 30);
                    const top = (start / timeline.totalMinutes) * 100;
                    const blockHeight = Math.max((height / timeline.totalMinutes) * 100, minBlockPct);
                    const color = palette[idx % palette.length];

                    return (
                        <div
                            key={`${occurrence.session.title}-${occurrence.starts_at}`}
                            className={cn("absolute left-2 right-2 rounded-lg border shadow-sm backdrop-blur p-3 text-sm", color)}
                            style={{top: `${top}%`, height: `${blockHeight}%`}}
                        >
                            <div className="font-semibold truncate">{occurrence.session.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                <CalendarClock className="h-4 w-4" />
                                <span>{formatTimeRange(occurrence.starts_at, occurrence.ends_at)}</span>
                            </div>
                            {occurrence.session.location && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{occurrence.session.location}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {occurrences.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        No sessions scheduled for this day.
                    </div>
                )}
            </div>
            <div className="relative border-l bg-card/40">
                {timeline.hours.map((hour) => (
                    <div
                        key={`right-${hour}`}
                        className="absolute inset-x-0 border-t border-transparent"
                        style={{top: `${((hour * 60 - timeline.startMinutes) / timeline.totalMinutes) * 100}%`}}
                    >
                        <span className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground">
                            {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
