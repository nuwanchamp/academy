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
import {CalendarClock, MapPin} from "lucide-react";
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

    const handleDateNavigate = (date?: Date) => {
        setSelectedDate(date);
        if (date) {
            const key = formatCalendarKey(date);
            navigate(`/study-sessions/calendar/${key}`);
        }
    };

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
                        <H3>{t("students.sectionTitle")}</H3>
                        <div className={"mt-6 flex flex-row gap-4 justify-between mb-6"}>
                            <div className="flex w-full max-w-sm items-center gap-2 text-inherit">
                                <Input type="search" placeholder={t("students.searchPlaceholder")}/>
                                <Button type="submit" variant="outline" className={" group hover:bg-primary cursor-pointer"}>
                                    <LucideSearch className={"text-primary group-hover:text-white"}/>
                                </Button>
                            </div>
                            <div className={"text-primary"}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button  variant="ghost"><LucideFilter/></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="leading-none font-medium">{t("students.filters.title")}</h4>
                                                <p className="text-muted-foreground text-sm">
                                                    {t("students.filters.description")}
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.moduleCount")}</Label>
                                                    <Input
                                                        type={"number"}
                                                        id="width"
                                                        defaultValue="2"
                                                        className="col-span-2 h-8"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.grade")}</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={t("students.filters.gradePlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>{t("students.filters.grade")}</SelectLabel>
                                                                {gradeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.completion")}</Label>
                                                    <Slider/>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div>
                            <StudentCard/>
                            <StudentCard/>
                            <StudentCard/>
                            <StudentCard/>
                        </div>
                        <div className={"text-primary mt-6"}>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" size={"default"}/>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#" size={"default"}>1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationEllipsis/>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" size={"default"}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
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
                            <div className="mt-4 space-y-2">
                                <H3 className="text-sm font-semibold">Day plan</H3>
                                {dayPlan.length === 0 ? (
                                    <P className="text-xs text-muted-foreground">No study sessions this day.</P>
                                ) : (
                                    dayPlan.map(({session, starts_at, ends_at, status}) => (
                                        <div key={`${session.id}-${starts_at}`} className="rounded-lg border px-3 py-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{session.title}</span>
                                                <Badge variant={status === "cancelled" ? "outline" : "secondary"} className="uppercase">
                                                    {status}
                                                </Badge>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <CalendarClock className="h-4 w-4" />
                                                <span>{formatTimeRange(starts_at, ends_at)}</span>
                                            </div>
                                            {session.location && (
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{session.location}</span>
                                                </div>
                                            )}
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Enrolled {session.enrolled_count}/{session.capacity} · Waitlist {session.waitlist_count}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className={"gap-0"}>
                            <H3 className={"text-left mb-0"}>{t("widgets.upcoming.title")}</H3>
                            <P className={"text-xs mt-0"}>{t("widgets.upcoming.subtitle")}</P>
                        </CardHeader>
                        <CardContent className={"flex flex-col"}>
                            {dayPlan.slice(0, 3).map(({session, starts_at, ends_at}) => (
                                <div key={`${session.id}-${starts_at}`} className="mb-3 last:mb-0">
                                    <UpcomingEvent
                                        title={session.title}
                                        time={formatTimeRange(starts_at, ends_at)}
                                        subtitle={`${session.enrolled_count} enrolled · Waitlist ${session.waitlist_count}`}
                                    />
                                </div>
                            ))}
                            {dayPlan.length === 0 && <P className="text-xs text-muted-foreground">Pick a date to see its sessions.</P>}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    )
}
