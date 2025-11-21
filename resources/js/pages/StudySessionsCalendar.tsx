import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {CalendarClock, MapPin, Users} from "lucide-react";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {listStudySessions, StudySessionDTO} from "@/lib/scheduling.ts";
import axios from "axios";
import {cn} from "@/lib/utils.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

type DayOccurrence = {
    session: StudySessionDTO;
    starts_at: string;
    ends_at: string;
    status: string;
    id: number;
};

const parseDateStr = (value?: string) => {
    if (!value) return undefined;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toDateKey = (date: Date) => date.toLocaleDateString("en-CA");

const toDisplayDate = (date: Date | undefined) =>
    date
        ? new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        }).format(date)
        : "";

const toTimeLabel = (value: string) => {
    const parsed = new Date(value.replace(" ", "T"));
    return new Intl.DateTimeFormat(undefined, {hour: "numeric", minute: "2-digit"}).format(parsed);
};

const toMinutes = (value: string) => {
    const parsed = new Date(value.replace(" ", "T"));
    return parsed.getHours() * 60 + parsed.getMinutes();
};

const toTimeRange = (start: string, end: string) => `${toTimeLabel(start)} – ${toTimeLabel(end)}`;

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));

const startOfWeek = (date: Date) => {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = (day + 6) % 7; // Monday as start
    copy.setDate(copy.getDate() - diff);
    return copy;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export default function StudySessionsCalendar() {
    const {date: dateParam} = useParams<{date?: string}>();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<StudySessionDTO[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOccurrence, setSelectedOccurrence] = useState<DayOccurrence | null>(null);
    const [view, setView] = useState<"day" | "week" | "month">("day");

    const selectedDate = useMemo(() => parseDateStr(dateParam) ?? new Date(), [dateParam]);
    const selectedKey = toDateKey(selectedDate);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await listStudySessions();
                setSessions(data ?? []);
                setError(null);
            } catch (err) {
                const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to load study sessions.";
                setError(message);
            }
        };
        load();
    }, []);

    const occurrencesByDate = useMemo(() => {
        return sessions.reduce<Record<string, DayOccurrence[]>>((acc, session) => {
            (session.occurrences ?? []).forEach((occurrence) => {
                const key = occurrence.starts_at.slice(0, 10);
                if (!acc[key]) acc[key] = [];
                acc[key].push({
                    session,
                    starts_at: occurrence.starts_at,
                    ends_at: occurrence.ends_at,
                    status: occurrence.status,
                    id: occurrence.id,
                });
            });
            return acc;
        }, {});
    }, [sessions]);

    const dayPlan = useMemo(() => {
        return (occurrencesByDate[selectedKey] ?? []).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }, [occurrencesByDate, selectedKey]);

    const weekDays = useMemo(() => {
        const start = startOfWeek(selectedDate);
        return Array.from({length: 7}, (_, idx) => {
            const d = new Date(start);
            d.setDate(start.getDate() + idx);
            return d;
        });
    }, [selectedDate]);

    const weekPlan = useMemo(() => {
        return weekDays.map((date) => {
            const key = toDateKey(date);
            return {
                date,
                key,
                events: (occurrencesByDate[key] ?? []).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
            };
        });
    }, [weekDays, occurrencesByDate]);

    const monthPlan = useMemo(() => {
        const start = startOfWeek(startOfMonth(selectedDate));
        const end = endOfMonth(selectedDate);
        const weeks: Array<Array<{date: Date; key: string; inMonth: boolean; events: DayOccurrence[]}>> = [];
        let cursor = new Date(start);
        while (cursor <= end || weeks.length === 0 || weeks[weeks.length - 1].length < 7) {
            const key = toDateKey(cursor);
            const inMonth = cursor.getMonth() === selectedDate.getMonth();
            const dayData = {
                date: new Date(cursor),
                key,
                inMonth,
                events: (occurrencesByDate[key] ?? []).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
            };
            if (weeks.length === 0 || weeks[weeks.length - 1].length === 7) {
                weeks.push([dayData]);
            } else {
                weeks[weeks.length - 1].push(dayData);
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        return weeks;
    }, [occurrencesByDate, selectedDate]);

    const flatMonthDays = useMemo(
        () => monthPlan.reduce<Array<{date: Date; key: string; inMonth: boolean; events: DayOccurrence[]}>>((all, week) => all.concat(week), []),
        [monthPlan]
    );

    const deriveTimeline = (events: DayOccurrence[], fallbackStart = 8 * 60, fallbackEnd = 18 * 60) => {
        const paddingMinutes = 60; // 1 hour breathing room
        if (events.length === 0) {
            const startHour = Math.floor((fallbackStart - paddingMinutes) / 60);
            const endHour = Math.ceil((fallbackEnd + paddingMinutes) / 60);
            return {
                startMinutes: fallbackStart - paddingMinutes,
                endMinutes: fallbackEnd + paddingMinutes,
                totalMinutes: fallbackEnd - fallbackStart + paddingMinutes * 2 || 60,
                hours: Array.from({length: endHour - startHour + 1}, (_, idx) => startHour + idx),
            };
        }
        const minStart = Math.min(...events.map((o) => toMinutes(o.starts_at)));
        const maxEnd = Math.max(...events.map((o) => toMinutes(o.ends_at)));
        const startMinutes = Math.min(fallbackStart, Math.floor(minStart / 60) * 60) - paddingMinutes;
        const endMinutes = Math.max(fallbackEnd, Math.ceil(maxEnd / 60) * 60) + paddingMinutes;
        const startHour = Math.floor(startMinutes / 60);
        const endHour = Math.ceil(endMinutes / 60);
        return {
            startMinutes,
            endMinutes,
            totalMinutes: endMinutes - startMinutes || 60,
            hours: Array.from({length: endHour - startHour + 1}, (_, idx) => startHour + idx),
        };
    };

    const dayTimeline = useMemo(() => deriveTimeline(dayPlan), [dayPlan]);
    const weekTimeline = useMemo(() => deriveTimeline(weekPlan.flatMap((d) => d.events)), [weekPlan]);

    useEffect(() => {
        const byPriority =
            view === "day"
                ? dayPlan
                : view === "week"
                    ? weekPlan.find((d) => d.events.length)?.events ?? []
                    : flatMonthDays.find((d) => d.events.length)?.events ?? [];
        setSelectedOccurrence(byPriority[0] ?? null);
    }, [view, dayPlan, weekPlan, flatMonthDays]);

    const handleDateSelect = (date?: Date) => {
        if (!date) return;
        navigate(`/study-sessions/calendar/${toDateKey(date)}`);
    };

    const handleShift = (direction: -1 | 1) => {
        const next = new Date(selectedDate);
        if (view === "month") {
            next.setMonth(selectedDate.getMonth() + direction, 1);
        } else if (view === "week") {
            next.setDate(selectedDate.getDate() + direction * 7);
        } else {
            next.setDate(selectedDate.getDate() + direction);
        }
        navigate(`/study-sessions/calendar/${toDateKey(next)}`);
    };

    const handleToday = () => {
        handleDateSelect(new Date());
    };

    const handleEdit = (occurrence: DayOccurrence) => {
        navigate(`/study-sessions?date=${selectedKey}&edit=${occurrence.session.id}&starts_at=${encodeURIComponent(occurrence.starts_at)}&ends_at=${encodeURIComponent(occurrence.ends_at)}`);
    };

    const handleCreate = () => {
        navigate(`/study-sessions?date=${selectedKey}`);
    };

    const eventBadges = ["bg-primary/15 text-primary", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800", "bg-sky-100 text-sky-800", "bg-rose-100 text-rose-800"];

    return (
        <div className="space-y-6">
            <PageHeading
                title="Calendar"
                lead="Schedule"
            />
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg">{toDisplayDate(selectedDate)}</CardTitle>
                            <CardDescription>All events scheduled around this date</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" onClick={handleToday}>Today</Button>
                            <Button variant="outline" onClick={() => handleShift(-1)}>Back</Button>
                            <Button variant="outline" onClick={() => handleShift(1)}>Next</Button>
                            <Button onClick={handleCreate}>Add session</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs value={view} onValueChange={(val) => setView(val as typeof view)}>
                            <TabsList>
                                <TabsTrigger value="month">Month</TabsTrigger>
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="day">Day</TabsTrigger>
                            </TabsList>
                            <TabsContent value="day" className="mt-3">
                                <div className="grid grid-cols-[80px_1fr_80px] h-[1100px] bg-muted/30 rounded-lg border overflow-hidden py-4">
                                    <div className="relative border-r bg-card/40">
                                        {dayTimeline.hours.map((hour) => (
                                            <div
                                                key={hour}
                                                className="absolute inset-x-0  border-muted-foreground/20"
                                                style={{top: `${((hour * 60 - dayTimeline.startMinutes) / dayTimeline.totalMinutes) * 100}%`}}
                                            >
                                                <span className="absolute left-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        {dayTimeline.hours.map((hour) => (
                                            <div
                                                key={`line-${hour}`}
                                                className="absolute inset-x-0 border-t border-muted-foreground/15"
                                                style={{top: `${((hour * 60 - dayTimeline.startMinutes) / dayTimeline.totalMinutes) * 100}%`}}
                                            />
                                        ))}
                                        {dayPlan.map((occurrence, idx) => {
                                            const start = clamp(0, toMinutes(occurrence.starts_at) - dayTimeline.startMinutes, dayTimeline.totalMinutes);
                                            const end = clamp(0, toMinutes(occurrence.ends_at) - dayTimeline.startMinutes, dayTimeline.totalMinutes);
                                            const minBlockPct = (48 / dayTimeline.totalMinutes) * 100;
                                            const height = Math.max(end - start, 30);
                                            const top = (start / dayTimeline.totalMinutes) * 100;
                                            const blockHeight = Math.max((height / dayTimeline.totalMinutes) * 100, minBlockPct);
                                            const isSelected = selectedOccurrence?.id === occurrence.id;
                                            const palette = ["bg-primary/10 border-primary/30", "bg-emerald-100/70 border-emerald-200", "bg-amber-100/70 border-amber-200", "bg-sky-100/70 border-sky-200", "bg-rose-100/70 border-rose-200"];
                                            const color = palette[idx % palette.length];

                                            return (
                                                <div
                                                    key={occurrence.id}
                                                    className={cn(
                                                        "absolute left-2 right-2 rounded-lg border shadow-sm backdrop-blur p-3 cursor-pointer transition text-sm",
                                                        color,
                                                        isSelected ? "ring-2 ring-primary/30 border-primary/50" : "hover:border-primary/50"
                                                    )}
                                                    style={{top: `${top}%`, height: `${blockHeight}%`}}
                                                    onClick={() => setSelectedOccurrence(occurrence)}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="font-semibold truncate">{occurrence.session.title}</div>
                                                        <Badge variant={occurrence.status === "cancelled" ? "outline" : "secondary"} className="uppercase text-[10px]">
                                                            {occurrence.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                        <CalendarClock className="h-4 w-4" />
                                                        <span>{toTimeLabel(occurrence.starts_at)} – {toTimeLabel(occurrence.ends_at)}</span>
                                                    </div>
                                                    {occurrence.session.location && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{occurrence.session.location}</span>
                                                        </div>
                                                    )}
                                                    <div className="text-[11px] text-muted-foreground mt-1">
                                                        {occurrence.session.enrolled_count}/{occurrence.session.capacity} enrolled · Waitlist {occurrence.session.waitlist_count}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {dayPlan.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                                                No sessions scheduled today.
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative border-l bg-card/40">
                                        {dayTimeline.hours.map((hour) => (
                                            <div
                                                key={`right-${hour}`}
                                                className="absolute inset-x-0 border-t border-transparent"
                                                style={{top: `${((hour * 60 - dayTimeline.startMinutes) / dayTimeline.totalMinutes) * 100}%`}}
                                            >
                                                <span className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="week" className="mt-3">
                                <div className="grid grid-cols-[80px_1fr_80px] h-[1100px] bg-muted/30 rounded-lg border overflow-hidden py-4">
                                    <div className="relative border-r bg-card/40">
                                        {weekTimeline.hours.map((hour) => (
                                            <div
                                                key={`week-left-${hour}`}
                                                className="absolute inset-x-0  border-muted-foreground/20"
                                                style={{top: `${((hour * 60 - weekTimeline.startMinutes) / weekTimeline.totalMinutes) * 100}%`}}
                                            >
                                                <span className="absolute left-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        {weekTimeline.hours.map((hour) => (
                                            <div
                                                key={`week-line-${hour}`}
                                                className="absolute inset-x-0 border-t border-muted-foreground/15"
                                                style={{top: `${((hour * 60 - weekTimeline.startMinutes) / weekTimeline.totalMinutes) * 100}%`}}
                                            />
                                        ))}
                                        <div className="relative h-full grid grid-cols-7 border-l">
                                            {weekPlan.map(({date, key, events}) => (
                                                <div key={key} className="relative border-r">
                                                    <div className="absolute right-1 top-1 text-[10px] text-muted-foreground">{date.getDate()}</div>
                                                    {events.length === 0 && (
                                                        <div className="text-[10px] text-muted-foreground absolute left-1 top-6">—</div>
                                                    )}
                                                    {events.map((occurrence, idx) => {
                                                        const start = clamp(0, toMinutes(occurrence.starts_at) - weekTimeline.startMinutes, weekTimeline.totalMinutes);
                                                        const end = clamp(0, toMinutes(occurrence.ends_at) - weekTimeline.startMinutes, weekTimeline.totalMinutes);
                                                        const minBlockPct = (48 / weekTimeline.totalMinutes) * 100;
                                                        const height = Math.max(end - start, 24);
                                                        const top = (start / weekTimeline.totalMinutes) * 100;
                                                        const blockHeight = Math.max((height / weekTimeline.totalMinutes) * 100, minBlockPct);
                                                        const isSelected = selectedOccurrence?.id === occurrence.id;
                                                        const color = eventBadges[(idx + date.getDate()) % eventBadges.length];

                                                        return (
                                                            <button
                                                                key={occurrence.id}
                                                                className={cn(
                                                                    "absolute left-1 right-1 rounded-md border px-2 py-1 text-left text-xs shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2",
                                                                    color,
                                                                    isSelected ? "ring-2 ring-primary/60 border-primary" : "border-border"
                                                                )}
                                                                style={{top: `${top}%`, height: `${blockHeight}%`}}
                                                                onClick={() => setSelectedOccurrence(occurrence)}
                                                            >
                                                                <div className="font-semibold truncate text-foreground/90">{occurrence.session.title}</div>
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                    <CalendarClock className="h-3 w-3" />
                                                                    <span className="truncate">{toTimeRange(occurrence.starts_at, occurrence.ends_at)}</span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative border-l bg-card/40">
                                        {weekTimeline.hours.map((hour) => (
                                            <div
                                                key={`week-right-${hour}`}
                                                className="absolute inset-x-0 border-t border-transparent"
                                                style={{top: `${((hour * 60 - weekTimeline.startMinutes) / weekTimeline.totalMinutes) * 100}%`}}
                                            >
                                                <span className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="month" className="mt-3">
                                <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                                        <div key={label} className="text-center">{label}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {flatMonthDays.map((day) => {
                                        const color = eventBadges[(day.date.getDate() + day.date.getMonth()) % eventBadges.length];
                                        return (
                                            <div
                                                key={`${day.key}-${day.date.getDate()}`}
                                                className={cn(
                                                    "min-h-32 rounded-lg border bg-card/70 p-2 flex flex-col gap-2 transition",
                                                    !day.inMonth && "opacity-60"
                                                )}
                                            >
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{day.date.getDate()}</span>
                                                    {day.events.length > 0 && <span className="text-[10px]">{day.events.length} events</span>}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {day.events.slice(0, 2).map((occurrence) => (
                                                        <button
                                                            key={occurrence.id}
                                                            className={cn(
                                                                "text-left rounded-md px-2 py-1 text-xs border transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2",
                                                                color
                                                            )}
                                                            onClick={() => setSelectedOccurrence(occurrence)}
                                                        >
                                                            <div className="font-semibold text-foreground/90 truncate">{occurrence.session.title}</div>
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <CalendarClock className="h-3 w-3" />
                                                                <span>{toTimeRange(occurrence.starts_at, occurrence.ends_at)}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {day.events.length > 2 && (
                                                        <span className="text-[10px] text-muted-foreground">+{day.events.length - 2} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                            <CardDescription>Jump to any date</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                className="w-full"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                onDayClick={handleDateSelect}
                                modifiers={{
                                    hasSession: (date) => {
                                        const key = toDateKey(date);
                                        return Boolean(occurrencesByDate[key]?.length);
                                    },
                                }}
                                modifiersClassNames={{
                                    hasSession: "relative after:absolute after:inset-x-2 after:bottom-1 after:flex after:flex-wrap after:gap-1",
                                }}
                                dayContent={(date) => {
                                    const key = toDateKey(date);
                                    const dots = occurrencesByDate[key] ?? [];
                                    const colors = ["bg-primary", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                                    return (
                                        <div className="relative flex size-full flex-col items-center justify-center">
                                            <span>{date.getDate()}</span>
                                            {dots.length > 0 && (
                                                <div className="mt-0.5 flex flex-wrap items-center justify-center gap-0.5">
                                                    {dots.slice(0, 4).map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={cn(
                                                                "h-1 w-1 rounded-full",
                                                                colors[idx % colors.length]
                                                            )}
                                                        />
                                                    ))}
                                                    {dots.length > 4 && (
                                                        <span className="text-[10px] text-muted-foreground leading-none">+{dots.length - 4}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>{selectedOccurrence ? selectedOccurrence.session.title : "Select an event"}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedOccurrence ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarClock className="h-4 w-4" />
                                        <span>{toTimeLabel(selectedOccurrence.starts_at)} – {toTimeLabel(selectedOccurrence.ends_at)}</span>
                                    </div>
                                    {selectedOccurrence.session.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedOccurrence.session.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{selectedOccurrence.session.enrolled_count} enrolled · Waitlist {selectedOccurrence.session.waitlist_count}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleEdit(selectedOccurrence)}>Edit in Study Sessions</Button>
                                        <Button size="sm" variant="outline" onClick={handleCreate}>Create session</Button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">Pick an event to view details.</p>
                            )}
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
