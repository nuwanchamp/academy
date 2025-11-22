import PageHeading from "@/components/ui/PageHeading.tsx";
import Actions from "@/components/ui/Actions.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {H3} from "@/components/ui/typography/h3";
import {P} from "@/components/ui/typography/P.tsx";
import UpcomingEvent from "@/components/ui/UpcomingEvent.tsx";
import StudentCard from "@/components/ui/StudentCard.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {LucideFilter, LucideSearch} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Slider} from "@/components/ui/slider.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useEffect, useMemo, useState} from "react";
import {listStudySessions, StudySessionDTO} from "@/lib/scheduling.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle, Bell, CalendarClock, MapPin} from "lucide-react";
import axios from "axios";
import {cn} from "@/lib/utils.ts";

const studentImageSrc = new URL("../../assets/students.svg", import.meta.url).href;
const modulesImageSrc = new URL("../../assets/modules.svg", import.meta.url).href;
const pathsImageSrc = new URL("../../assets/paths.svg", import.meta.url).href;
const reportsImageSrc = new URL("../../assets/reports.svg", import.meta.url).href;

export const Dashboard = () => {

    const navigate = useNavigate();
    const {t} = useTranslation("dashboard");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [sessions, setSessions] = useState<StudySessionDTO[]>([]);
    const [calendarError, setCalendarError] = useState<string | null>(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const data = await listStudySessions();
                setSessions(data ?? []);
                setCalendarError(null);
            } catch (err) {
                const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to load sessions.";
                setCalendarError(message);
            }
        };
        loadSessions();
    }, []);

    const formatCalendarKey = (date: Date) => date.toLocaleDateString("en-CA");
    const occurrencesByDate = useMemo(() => {
        const byDate: Record<string, Array<{ session: StudySessionDTO; starts_at: string; ends_at: string; status: string }>> = {};
        sessions.forEach((session) => {
            (session.occurrences ?? []).forEach((occurrence) => {
                const key = occurrence.starts_at.slice(0, 10);
                if (!byDate[key]) byDate[key] = [];
                byDate[key].push({
                    session,
                    starts_at: occurrence.starts_at,
                    ends_at: occurrence.ends_at,
                    status: occurrence.status,
                });
            });
        });
        return byDate;
    }, [sessions]);

    const dayPlan = useMemo(() => {
        if (!selectedDate) return [];
        const key = formatCalendarKey(selectedDate);
        return occurrencesByDate[key]?.sort((a, b) => a.starts_at.localeCompare(b.starts_at)) ?? [];
    }, [selectedDate, occurrencesByDate]);

    const formatTimeRange = (start: string, end: string) => {
        const startDate = new Date(start.replace(" ", "T"));
        const endDate = new Date(end.replace(" ", "T"));
        const formatter = new Intl.DateTimeFormat(undefined, {hour: "2-digit", minute: "2-digit"});
        return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
    };

    const toMinutes = (value: string) => {
        const parsed = new Date(value.replace(" ", "T"));
        return parsed.getHours() * 60 + parsed.getMinutes();
    };

    const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(max, value));

    const deriveTimeline = (events: typeof dayPlan) => {
        const fallbackStart = 8 * 60;
        const fallbackEnd = 18 * 60;
        const padding = 60;
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
    };

    const timeline = useMemo(() => deriveTimeline(dayPlan), [dayPlan]);

    const handleDateNavigate = (date?: Date) => {
        setSelectedDate(date);
        if (date) {
            const key = formatCalendarKey(date);
            navigate(`/study-sessions/calendar/${key}`);
        }
    };

    const notifications = useMemo(() => {
        return dayPlan.slice(0, 4).map(({session, starts_at, ends_at, status}) => {
            const message = status === "cancelled"
                ? `${session.title} was cancelled`
                : `${session.title} starts at ${formatTimeRange(starts_at, ends_at)}`;
            return {id: `${session.id}-${starts_at}-note`, message, status};
        });
    }, [dayPlan]);

    const quickActions = [
        {
            key: "newStudent",
            image: studentImageSrc,
            label: t("quickActions.newStudent"),
            alt: t("quickActions.newStudent"),
            onClick: () => {
                navigate("/students/create");
            },
        },
        {
            key: "createModule",
            image: modulesImageSrc,
            label: t("quickActions.createModule"),
            alt: t("quickActions.createModule"),
            onClick: () => {
                navigate("/module/create");
            },
        },
        {
            key: "createPath",
            image: pathsImageSrc,
            label: t("quickActions.createPath"),
            alt: t("quickActions.createPath"),
            onClick: () => {
                navigate("/path/create");
            },
        },
        {
            key: "reports",
            image: reportsImageSrc,
            label: t("quickActions.reports"),
            alt: t("quickActions.reports"),
            onClick: () => {
                navigate("/reports");
            },
        },
    ] as const;

    const gradeOptions = [
        {value: "grade3", label: t("students.filters.gradeOptions.grade3")},
        {value: "grade4", label: t("students.filters.gradeOptions.grade4")},
        {value: "grade5", label: t("students.filters.gradeOptions.grade5")},
    ];

    return (
        <>
            <div className={"w-full flex justify-between items-center"}>
                <PageHeading lead={t("heading.lead")} title={t("heading.title")}/>
                <Actions/>
            </div>
            <div className={"w-full flex gap-4 justify-between items-start"}>
                <div className={"flex w-2/3 flex-col gap-4 mt-6 justify-between"}>
                    <div className={"flex flex-row gap-4 mt-6 justify-between"}>
                        {quickActions.map((action) => (
                            <Card
                                key={action.key}
                                className={"w-1/4 cursor-pointer hover:shadow-lg hover:border-primary/20"}
                                onClick={action.onClick}
                            >
                                <CardContent>
                                    <div className={"flex flex-col gap-4 items-center justify-start"}>
                                        <img src={action.image} alt={action.alt} className={"w-40"}/>
                                        <h3 className={action.key === "reports" ? "font-semibold" : ""}>{action.label}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className={"w-full"}>
                        <H3>Day schedule</H3>
                        <P className="text-sm text-muted-foreground mt-1">Time-aligned view of study sessions for the selected date.</P>
                        <div className="flex flex-wrap gap-3 mt-3 items-center justify-between text-primary">
                            <div className="text-sm text-muted-foreground">
                                {selectedDate ? selectedDate.toLocaleDateString(undefined, {weekday: "long", month: "long", day: "numeric", year: "numeric"}) : ""}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Today</Button>
                                <Button variant="outline" onClick={() => setSelectedDate((prev) => new Date((prev ?? new Date()).getTime() - 24*60*60*1000))}>Back</Button>
                                <Button variant="outline" onClick={() => setSelectedDate((prev) => new Date((prev ?? new Date()).getTime() + 24*60*60*1000))}>Next</Button>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-[70px_1fr_70px] h-[820px] bg-muted/30 rounded-lg border overflow-hidden py-6">
                            <div className="relative border-r bg-card/40">
                                {timeline.hours.map((hour) => (
                                    <div
                                        key={`left-${hour}`}
                                        className="absolute inset-x-0  border-muted-foreground/20"
                                        style={{top: `${((hour * 60 - timeline.startMinutes) / timeline.totalMinutes) * 100}%`}}
                                    >
                                        <span className="absolute left-2 -translate-y-1/2 text-xs text-muted-foreground">
                                            {`${((hour + 11) % 12) + 1} ${hour < 12 ? "AM" : "PM"}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                {selectedDate && (() => {
                                    const now = new Date();
                                    const isToday = now.toDateString() === selectedDate.toDateString();
                                    if (!isToday) return null;
                                    const nowMinutes = now.getHours() * 60 + now.getMinutes();
                                    const shadedPct = clamp(0, ((nowMinutes - timeline.startMinutes) / timeline.totalMinutes) * 100, 100);
                                    return (
                                        <>
                                            <div
                                                className="absolute inset-x-0 top-0 bg-muted/60"
                                                style={{height: `${shadedPct}%`}}
                                            />
                                            <div
                                                className="absolute inset-x-0 border-t border-primary/60"
                                                style={{top: `${shadedPct}%`}}
                                            >
                                                <span className="absolute left-2 -translate-y-1/2 text-[11px] text-primary font-semibold bg-card px-1 rounded-sm">
                                                    Now
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                                {timeline.hours.map((hour) => (
                                    <div
                                        key={`line-${hour}`}
                                        className="absolute inset-x-0 border-t border-muted-foreground/15"
                                        style={{top: `${((hour * 60 - timeline.startMinutes) / timeline.totalMinutes) * 100}%`}}
                                    />
                                ))}
                                {dayPlan.map((occurrence, idx) => {
                                    const start = clamp(0, toMinutes(occurrence.starts_at) - timeline.startMinutes, timeline.totalMinutes);
                                    const end = clamp(0, toMinutes(occurrence.ends_at) - timeline.startMinutes, timeline.totalMinutes);
                                    const minBlockPct = (48 / timeline.totalMinutes) * 100;
                                    const height = Math.max(end - start, 30);
                                    const top = (start / timeline.totalMinutes) * 100;
                                    const blockHeight = Math.max((height / timeline.totalMinutes) * 100, minBlockPct);
                                    const palette = ["bg-primary/10 border-primary/30", "bg-emerald-100/70 border-emerald-200", "bg-amber-100/70 border-amber-200", "bg-sky-100/70 border-sky-200", "bg-rose-100/70 border-rose-200"];
                                    const color = palette[idx % palette.length];
                                    return (
                                        <div
                                            key={`${occurrence.session.id}-${occurrence.starts_at}`}
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
                                {dayPlan.length === 0 && (
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
                    </div>
                </div>
                <div className={"w-1/3 bg-gray-100 mt-6 flex flex-col gap-4 p-4 rounded-xl"}>
                    <Card>
                        <CardHeader className={"gap-0"}>
                            <H3 className={"text-left mb-0"}>{t("widgets.calendar.title")}</H3>
                            <P className={"text-xs mt-0"}>{t("widgets.calendar.subtitle")}</P>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                className={"w-full"}
                                selected={selectedDate}
                                onSelect={handleDateNavigate}
                                onDayClick={handleDateNavigate}
                                modifiers={{
                                    hasSession: (date) => {
                                        const key = formatCalendarKey(date);
                                        return Boolean(occurrencesByDate[key]?.length);
                                    },
                                }}
                                modifiersClassNames={{
                                    hasSession: "relative after:absolute after:inset-x-2 after:bottom-1 after:flex after:flex-wrap after:gap-1",
                                }}
                                dayContent={(date) => {
                                    const key = formatCalendarKey(date);
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
                            {calendarError && (
                                <p className="mt-3 text-xs text-destructive">{calendarError}</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className={"gap-0"}>
                            <H3 className={"text-left mb-0 flex items-center gap-2"}><Bell className="h-4 w-4" /> Notifications</H3>
                            <P className={"text-xs mt-0"}>Recent session alerts</P>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {notifications.length === 0 ? (
                                <P className="text-xs text-muted-foreground">Nothing new for this day.</P>
                            ) : (
                                notifications.map((note) => (
                                    <div key={note.id} className="flex items-start gap-2 rounded-md border px-3 py-2">
                                        <div className={cn(
                                            "mt-0.5 rounded-full p-1",
                                            note.status === "cancelled" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {note.status === "cancelled" ? <AlertTriangle className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                                        </div>
                                        <div className="text-xs leading-relaxed text-foreground">{note.message}</div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    )
}
