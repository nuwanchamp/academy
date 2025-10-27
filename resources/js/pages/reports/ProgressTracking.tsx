import {ReportLayout} from "@/components/reports/ReportLayout.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CalendarClock,
    Clock3,
    Download,
    Flag,
    Target,
    TrendingUp,
    Users,
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {Link} from "react-router-dom";

type SummaryCard = {
    id: string;
    label: string;
    value: string;
    deltaLabel: string;
    positive?: boolean;
    icon: LucideIcon;
};

type CourseProgress = {
    id: string;
    title: string;
    facilitator: string;
    completion: number;
    outcomesMet: string;
    status: "On track" | "Watch" | "Behind";
    flaggedStudents: number;
    lastUpdate: string;
};

type StudentAlert = {
    id: string;
    name: string;
    grade: string;
    path: string;
    completion: number;
    pace: string;
    lastEvidence: string;
    nextStep: string;
};

type MilestoneReminder = {
    id: string;
    title: string;
    date: string;
    type: "Check-in" | "Assessment" | "Celebration";
    focus: string;
};

const summaryCards: SummaryCard[] = [
    {
        id: "overall-completion",
        label: "Overall completion",
        value: "72%",
        deltaLabel: "+5 pts vs last week",
        positive: true,
        icon: TrendingUp,
    },
    {
        id: "on-track",
        label: "Learners on track",
        value: "21 / 32",
        deltaLabel: "4 learners flagged",
        positive: false,
        icon: Users,
    },
    {
        id: "checkins",
        label: "Avg daily check-ins",
        value: "2.4",
        deltaLabel: "+0.4 vs prior week",
        positive: true,
        icon: Clock3,
    },
];

const courses: CourseProgress[] = [
    {
        id: "sensory-foundations",
        title: "Sensory Exploration Foundations",
        facilitator: "Jo Walsh",
        completion: 84,
        outcomesMet: "4 / 5 outcomes met",
        status: "On track",
        flaggedStudents: 1,
        lastUpdate: "Today at 8:20 AM",
    },
    {
        id: "calming-toolkit",
        title: "Calming Toolkit Lab",
        facilitator: "Ellie Summers",
        completion: 68,
        outcomesMet: "3 / 5 outcomes met",
        status: "Watch",
        flaggedStudents: 2,
        lastUpdate: "Yesterday at 4:15 PM",
    },
    {
        id: "reflection-stories",
        title: "Reflection Stories",
        facilitator: "Jordan Rivers",
        completion: 46,
        outcomesMet: "1 / 4 outcomes met",
        status: "Behind",
        flaggedStudents: 3,
        lastUpdate: "2 days ago",
    },
    {
        id: "sensory-showcase",
        title: "Sensory Showcase",
        facilitator: "Alex Rivera",
        completion: 12,
        outcomesMet: "Planning phase",
        status: "Watch",
        flaggedStudents: 0,
        lastUpdate: "Scheduled",
    },
];

const studentsNeedingSupport: StudentAlert[] = [
    {
        id: "avery-chen",
        name: "Avery Chen",
        grade: "Grade 4",
        path: "Sensory Independence Track",
        completion: 42,
        pace: "2 lessons behind",
        lastEvidence: "4 days ago",
        nextStep: "Schedule calming toolkit refresh",
    },
    {
        id: "noah-alvarez",
        name: "Noah Alvarez",
        grade: "Grade 3",
        path: "Self-Regulation Discovery",
        completion: 38,
        pace: "1 lesson behind",
        lastEvidence: "Last captured Apr 3",
        nextStep: "Send guardian checkpoint form",
    },
    {
        id: "lina-patel",
        name: "Lina Patel",
        grade: "Grade 5",
        path: "Sensory Integration",
        completion: 55,
        pace: "On pace",
        lastEvidence: "Yesterday",
        nextStep: "Plan reflection interview",
    },
];

const milestoneReminders: MilestoneReminder[] = [
    {
        id: "checkpoint",
        title: "Module 2 completion checkpoint",
        date: "Apr 8 · 10:00 AM",
        type: "Check-in",
        focus: "Verify calming toolkit uploads",
    },
    {
        id: "assessment",
        title: "Mid-module reflection pulse",
        date: "Apr 10 · During homeroom",
        type: "Assessment",
        focus: "Capture student self-rating on regulation skills",
    },
    {
        id: "celebration",
        title: "Family celebration guide",
        date: "Apr 12 · Send by 3:00 PM",
        type: "Celebration",
        focus: "Share badge highlights and suggested home routines",
    },
];

const statusTone: Record<CourseProgress["status"], "default" | "secondary" | "destructive"> = {
    "On track": "default",
    "Watch": "secondary",
    "Behind": "destructive",
};

export default function ProgressTrackingReport() {
    return (
        <ReportLayout
            breadcrumbs={["Student Performance Reports", "Progress Tracking"]}
            lead="Mastery pulse"
            title="Progress Tracking"
            description="Monitor how learners are moving through modules, surface completion gaps, and cue next best actions before momentum slips."
            badges={[
                {label: "Grade 3 – 5 Sensory Path"},
                {label: "Rolling 30 days"},
                {label: "Last sync • Today 08:15", variant: "outline"},
            ]}
            meta={[
                {label: "Students", value: "32"},
                {label: "Facilitators", value: "4"},
            ]}
            actions={
                <>
                    <Button size="lg" className="gap-2">
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                        <CalendarClock className="size-4" />
                        Schedule sync
                    </Button>
                </>
            }
        >
            <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    const isNegative = card.positive === false;
                    const isPositive = card.positive === true;
                    return (
                        <Card key={card.id}>
                            <CardContent className="space-y-4 p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                                        <Icon className="size-4" />
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-primary">{card.value}</span>
                                    <Badge
                                        variant={isNegative ? "destructive" : isPositive ? "default" : "secondary"}
                                        className={cn("flex items-center gap-1")}
                                    >
                                        {isNegative ? (
                                            <ArrowDownRight className="size-3" />
                                        ) : (
                                            <ArrowUpRight className="size-3" />
                                        )}
                                        <span>{card.deltaLabel}</span>
                                    </Badge>
                                </div>
                                {card.id === "overall-completion" ? (
                                    <Progress value={72} />
                                ) : null}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course completion snapshot</CardTitle>
                    <CardDescription>Track where learners are moving smoothly and where to intervene.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course / Unit</TableHead>
                                <TableHead>Facilitator</TableHead>
                                <TableHead className="w-48">Completion</TableHead>
                                <TableHead>Outcomes met</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Flagged learners</TableHead>
                                <TableHead>Last update</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium text-primary">{course.title}</TableCell>
                                    <TableCell>{course.facilitator}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                                <span>{course.completion}%</span>
                                                <span>Goal 90%</span>
                                            </div>
                                            <Progress value={course.completion} />
                                        </div>
                                    </TableCell>
                                    <TableCell>{course.outcomesMet}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusTone[course.status]}>
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {course.flaggedStudents > 0 ? (
                                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
                                                <Flag className="size-3" />
                                                {course.flaggedStudents}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{course.lastUpdate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Learners needing support</CardTitle>
                        <CardDescription>Focus on learners who are falling behind or missing evidence uploads.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {studentsNeedingSupport.map((student, index) => (
                            <div key={student.name} className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", index !== studentsNeedingSupport.length - 1 && "pb-4 border-b border-dashed border-border")}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-primary">{student.name}</h3>
                                        <Badge variant="outline">{student.grade}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{student.path}</p>
                                </div>
                                <div className="flex w-full flex-col gap-3 md:w-2/5">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Completion</span>
                                            <span>{student.completion}%</span>
                                        </div>
                                        <Progress value={student.completion} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <AlertTriangle className="size-3 text-destructive" />
                                            {student.pace}
                                        </span>
                                        <Separator orientation="vertical" className="h-4 bg-border" />
                                        <span>Last evidence · {student.lastEvidence}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 text-sm text-muted-foreground md:w-1/4">
                                    <span className="font-semibold text-primary">Next step</span>
                                    <p>{student.nextStep}</p>
                                    <Button variant="ghost" size="sm" className="justify-start text-primary" asChild>
                                        <Link to={`/reports/progress-tracking/${student.id}`}>
                                            Open progress report
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Milestones & nudges</CardTitle>
                        <CardDescription>Coordinate upcoming checkpoints with facilitators and families.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {milestoneReminders.map((milestone, index) => (
                            <div key={milestone.id} className={cn("space-y-2", index !== milestoneReminders.length - 1 && "pb-4 border-b border-border/40")}>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="uppercase tracking-wide text-xs">
                                        {milestone.type}
                                    </Badge>
                                    <span className="text-xs font-medium text-muted-foreground">{milestone.date}</span>
                                </div>
                                <p className="text-sm font-semibold text-primary">{milestone.title}</p>
                                <p className="text-sm text-muted-foreground">{milestone.focus}</p>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button variant="ghost" size="sm" className="gap-2 text-primary">
                            <Target className="size-4" />
                            View full schedule
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Outcome coverage</CardTitle>
                    <CardDescription>Map current evidence uploads to expected learning outcomes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {label: "Sensory vocabulary", completion: 78, status: "On track"},
                            {label: "Regulation routines", completion: 64, status: "Watch"},
                            {label: "Observation self-report", completion: 52, status: "Behind"},
                            {label: "Family feedback loop", completion: 88, status: "On track"},
                        ].map((outcome) => (
                            <div key={outcome.label} className="space-y-3 rounded-lg border border-dashed border-border p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-primary">{outcome.label}</p>
                                    <Badge variant={outcome.status === "Behind" ? "destructive" : outcome.status === "Watch" ? "secondary" : "default"}>
                                        {outcome.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{outcome.completion}% evidence logged</span>
                                    <span>Goal 85%</span>
                                </div>
                                <Progress value={outcome.completion} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </ReportLayout>
    );
}
