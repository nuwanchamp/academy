import {useEffect, useMemo, useState} from "react";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {createStudySession, listStudySessions, StudySessionDTO, StudySessionPayload, updateStudySession} from "@/lib/scheduling.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {AlertCircle, CalendarClock, MapPin, Users} from "lucide-react";
import axios from "axios";
import {useSearchParams} from "react-router-dom";

type FormState = Omit<StudySessionPayload, "recurrence">;

const defaultForm: FormState = {
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    location: "",
    meeting_url: "",
    capacity: 4,
    timezone: "UTC",
};

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";
    const parsed = new Date(value.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
};

const StudySessions = () => {
    const [sessions, setSessions] = useState<StudySessionDTO[]>([]);
    const [form, setForm] = useState<FormState>(defaultForm);
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const [selectedDate, setSelectedDate] = useState<string | null>(searchParams.get("date"));

    useEffect(() => {
        const dateParam = searchParams.get("date");
        if (dateParam) {
            const start = `${dateParam}T15:00`;
            const end = `${dateParam}T16:00`;
            setForm((prev) => ({...prev, starts_at: start, ends_at: end}));
            setSelectedDate(dateParam);
        } else {
            setSelectedDate(null);
        }
    }, [searchParams]);

    const loadSessions = async () => {
        setIsLoading(true);
        try {
            const data = await listStudySessions();
            setSessions(data ?? []);
            setError(null);
        } catch (err) {
            const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to load study sessions.";
            setError(message);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleInput = (key: keyof FormState, value: string | number) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    const toPayloadDate = (value: string) => {
        if (!value) return value;
        if (value.includes("T")) {
            return `${value.replace("T", " ")}:00`;
        }
        return value;
    };

    const nextOccurrence = useMemo(() => {
        return sessions
            .flatMap((session) => session.occurrences ?? [])
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
    }, [sessions]);

    const totals = useMemo(() => {
        return sessions.reduce(
            (acc, session) => {
                acc.enrolled += session.enrolled_count;
                acc.waitlist += session.waitlist_count;
                return acc;
            },
            {enrolled: 0, waitlist: 0}
        );
    }, [sessions]);

    const occurrencesByDate = useMemo(() => {
        return sessions.reduce<Record<string, Array<{session: StudySessionDTO; starts_at: string; ends_at: string; status: string; id: number}>>>((acc, session) => {
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

    const selectedDateKey = useMemo(() => {
        if (selectedDate) return selectedDate;
        const firstDate = Object.keys(occurrencesByDate)[0];
        return firstDate ?? null;
    }, [occurrencesByDate, selectedDate]);

    const resetForm = () => {
        const template = selectedDateKey
            ? {...defaultForm, starts_at: `${selectedDateKey}T09:00`, ends_at: `${selectedDateKey}T10:00`}
            : defaultForm;
        setForm(template);
        setEditingSessionId(null);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload: StudySessionPayload = {
                ...form,
                starts_at: toPayloadDate(form.starts_at),
                ends_at: toPayloadDate(form.ends_at),
                description: form.description || null,
                location: form.location || null,
                meeting_url: form.meeting_url || null,
                recurrence: null,
            };
            if (editingSessionId) {
                await updateStudySession(editingSessionId, payload);
            } else {
                await createStudySession(payload);
            }
            resetForm();
            await loadSessions();
        } catch (err) {
            const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to save session.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dayPlan = useMemo(() => {
        if (!selectedDateKey) return [];
        return (occurrencesByDate[selectedDateKey] ?? []).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }, [occurrencesByDate, selectedDateKey]);

    const formatDayLabel = (dateKey: string) => {
        const parsed = new Date(`${dateKey}T00:00:00`);
        return new Intl.DateTimeFormat(undefined, {weekday: "long", month: "long", day: "numeric", year: "numeric"}).format(parsed);
    };

    const toInputDateTime = (value: string) => {
        if (!value) return "";
        return value.includes("T") ? value.slice(0, 16) : value.replace(" ", "T").slice(0, 16);
    };

    const scrollToForm = () => {
        const formNode = document.getElementById("session-form");
        if (formNode && typeof formNode.scrollIntoView === "function") {
            formNode.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const handleSelectForEdit = (session: StudySessionDTO, starts_at: string, ends_at: string) => {
        setEditingSessionId(session.id);
        setForm({
            title: session.title,
            description: session.description ?? "",
            starts_at: toInputDateTime(starts_at),
            ends_at: toInputDateTime(ends_at),
            location: session.location ?? "",
            meeting_url: session.meeting_url ?? "",
            capacity: session.capacity,
            timezone: session.timezone ?? "UTC",
        });
        scrollToForm();
    };

    const startCreationForDate = () => {
        resetForm();
        scrollToForm();
    };

    useEffect(() => {
        const editId = searchParams.get("edit");
        if (!editId || sessions.length === 0) return;
        const session = sessions.find((s) => String(s.id) === editId);
        if (!session) return;
        const startsHint = searchParams.get("starts_at") ?? session.starts_at;
        const endsHint = searchParams.get("ends_at") ?? session.ends_at;
        setEditingSessionId(session.id);
        setForm({
            title: session.title,
            description: session.description ?? "",
            starts_at: toInputDateTime(startsHint),
            ends_at: toInputDateTime(endsHint),
            location: session.location ?? "",
            meeting_url: session.meeting_url ?? "",
            capacity: session.capacity,
            timezone: session.timezone ?? "UTC",
        });
        scrollToForm();
    }, [sessions, searchParams]);

    return (
        <div className="space-y-6">
            <PageHeading
                title="Study sessions"
                description="Plan small-group sessions, manage capacity, and keep families informed with reminders."
            />

            {selectedDateKey && (
                <Card id="day-plan" className="shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg">Day plan</CardTitle>
                            <CardDescription>{formatDayLabel(selectedDateKey)}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={startCreationForDate}>Create session</Button>
                            <Button variant="ghost" asChild>
                                <a href="#session-form">Go to form</a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {dayPlan.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sessions scheduled for this day.</p>
                        ) : (
                            dayPlan.map(({session, starts_at, ends_at, status, id}) => (
                                <div
                                    key={id}
                                    className="rounded-lg border px-3 py-2 hover:border-primary/40 hover:shadow-sm transition cursor-pointer"
                                    onClick={() => handleSelectForEdit(session, starts_at, ends_at)}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{session.title}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <CalendarClock className="h-4 w-4" />
                                                <span>{formatDateTime(starts_at)} → {formatDateTime(ends_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={status === "cancelled" ? "outline" : "secondary"} className="uppercase">
                                                {status}
                                            </Badge>
                                            <Button size="sm" variant="ghost" onClick={(event) => {
                                                event.stopPropagation();
                                                handleSelectForEdit(session, starts_at, ends_at);
                                            }}>Edit</Button>
                                        </div>
                                    </div>
                                    {session.location && (
                                        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{session.location}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
                    <CardHeader>
                        <CardTitle className="text-lg">Sessions</CardTitle>
                        <CardDescription>Total scheduled in your view</CardDescription>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{sessions.length}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Enrolled seats</CardTitle>
                        <CardDescription>Across all sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{totals.enrolled}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Waitlist</CardTitle>
                        <CardDescription>Students waiting</CardDescription>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{totals.waitlist}</CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card id="session-form" className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>{editingSessionId ? "Edit study session" : "Create a quick session"}</CardTitle>
                        <CardDescription>Set up a one-off or kickoff for a series. Times are stored in UTC.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={form.title} onChange={(e) => handleInput("title", e.target.value)} placeholder="Reading lab" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location / Room</Label>
                            <Input id="location" value={form.location ?? ""} onChange={(e) => handleInput("location", e.target.value)} placeholder="Room 12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="starts_at">Starts at</Label>
                            <Input id="starts_at" type="datetime-local" value={form.starts_at} onChange={(e) => handleInput("starts_at", e.target.value)} placeholder="2025-02-01 15:00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ends_at">Ends at</Label>
                            <Input id="ends_at" type="datetime-local" value={form.ends_at} onChange={(e) => handleInput("ends_at", e.target.value)} placeholder="2025-02-01 16:00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input id="capacity" type="number" min={1} max={50} value={form.capacity} onChange={(e) => handleInput("capacity", Number(e.target.value))} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={form.description ?? ""} onChange={(e) => handleInput("description", e.target.value)} placeholder="Small group comprehension support" />
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                                Next upcoming: {nextOccurrence ? formatDateTime(nextOccurrence.starts_at) : "No upcoming sessions"}
                            </div>
                            <div className="flex items-center gap-2">
                                {editingSessionId && (
                                    <Button variant="ghost" onClick={resetForm} type="button">
                                        Cancel edit
                                    </Button>
                                )}
                                <Button onClick={handleSubmit} disabled={isSubmitting || !form.title || !form.starts_at || !form.ends_at}>
                                    {isSubmitting ? "Saving…" : editingSessionId ? "Update session" : "Create session"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                        <CardDescription>Occurrences across your sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[420px] overflow-auto">
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">Loading your study sessions…</p>
                        ) : sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No study sessions yet.</p>
                        ) : (
                            sessions
                                .flatMap((session) => (session.occurrences ?? []).map((occurrence) => ({session, occurrence})))
                                .sort((a, b) => a.occurrence.starts_at.localeCompare(b.occurrence.starts_at))
                                .map(({session, occurrence}) => (
                                    <div key={occurrence.id} className="rounded-lg border px-3 py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{session.title}</div>
                                            <Badge variant={occurrence.status === "cancelled" ? "outline" : "secondary"}>
                                                {occurrence.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <CalendarClock className="h-4 w-4" />
                                            <span>{formatDateTime(occurrence.starts_at)}</span>
                                        </div>
                                        {session.location && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{session.location}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 py-4 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <div>
                            <p className="font-medium">Unable to load study sessions</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                    <Card className="border-dashed md:col-span-2">
                        <CardContent className="py-10 text-center text-muted-foreground">Loading your study sessions…</CardContent>
                    </Card>
                ) : sessions.length === 0 ? (
                    <Card className="border-dashed md:col-span-2">
                        <CardContent className="py-12 text-center">
                            <CardTitle className="text-lg">No study sessions yet</CardTitle>
                            <CardDescription>Use the quick form above to start scheduling.</CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    sessions.map((session) => (
                        <Card key={session.id} className="shadow-sm">
                            <CardHeader className="flex flex-row items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        {session.title}
                                        <Badge variant={session.status === "cancelled" ? "outline" : "secondary"} className="uppercase">
                                            {session.status}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{session.description ?? "No description provided."}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{session.enrolled_count}/{session.capacity}</span>
                                    <Badge variant="outline">Waitlist {session.waitlist_count}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarClock className="h-4 w-4" />
                                    <span>{formatDateTime(session.starts_at)} → {formatDateTime(session.ends_at)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(session.occurrences ?? []).map((occurrence) => (
                                        <Badge key={occurrence.id} variant={occurrence.status === "cancelled" ? "outline" : "secondary"}>
                                            {formatDateTime(occurrence.starts_at)}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudySessions;
