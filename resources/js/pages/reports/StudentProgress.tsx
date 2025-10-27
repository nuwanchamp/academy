import {useMemo} from "react";
import {useParams, Link} from "react-router-dom";
import {ReportLayout} from "@/components/reports/ReportLayout.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
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
    ArrowRight,
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    Download,
    Flag,
    MessageSquareText,
    Target,
    TrendingUp,
} from "lucide-react";

type ModuleProgress = {
    id: string;
    title: string;
    status: "On track" | "Watch" | "Behind";
    completion: number;
    lastEvidence: string;
    outcomesMet: number;
    outcomesTotal: number;
    nextAction: string;
};

type EvidenceHighlight = {
    id: string;
    type: "Photo" | "Reflection" | "Video" | "Survey";
    title: string;
    capturedAt: string;
    summary: string;
};

type Intervention = {
    id: string;
    label: string;
    owner: string;
    due: string;
    status: "Scheduled" | "In progress" | "Complete";
    description: string;
};

type StudentProgress = {
    id: string;
    name: string;
    preferredName?: string;
    grade: string;
    path: string;
    homeroom: string;
    teacher: string;
    guardian: string;
    guardianContact: string;
    updatedAt: string;
    completion: number;
    paceLabel: string;
    mastery: number;
    evidenceStreak: number;
    summary: string;
    modules: ModuleProgress[];
    evidence: EvidenceHighlight[];
    interventions: Intervention[];
    celebrations: string[];
    focusAreas: string[];
};

const studentReports: Record<string, StudentProgress> = {
    "avery-chen": {
        id: "avery-chen",
        name: "Avery Chen",
        preferredName: "Avery",
        grade: "Grade 4",
        path: "Sensory Independence Track",
        homeroom: "Sunrise Cohort",
        teacher: "Jo Walsh",
        guardian: "Morgan Chen",
        guardianContact: "(555) 213-9110",
        updatedAt: "Apr 8, 2025 · 08:20 AM",
        completion: 42,
        paceLabel: "2 lessons behind (Module 2)",
        mastery: 68,
        evidenceStreak: 3,
        summary:
            "Avery is building confidence naming sensory triggers but needs additional coaching to capture calming routine evidence consistently.",
        modules: [
            {
                id: "module-1",
                title: "Sensory Welcome & Baseline",
                status: "On track",
                completion: 100,
                lastEvidence: "Mar 28 · Teacher reflection",
                outcomesMet: 3,
                outcomesTotal: 3,
                nextAction: "Share baseline summary with caregiver",
            },
            {
                id: "module-2",
                title: "Calming Toolkit Lab",
                status: "Watch",
                completion: 54,
                lastEvidence: "Apr 3 · Photo upload",
                outcomesMet: 2,
                outcomesTotal: 4,
                nextAction: "Capture calming video routine with Avery",
            },
            {
                id: "module-3",
                title: "Reflection Stories",
                status: "Behind",
                completion: 18,
                lastEvidence: "Not yet captured",
                outcomesMet: 0,
                outcomesTotal: 4,
                nextAction: "Schedule reflection interview during advisory",
            },
        ],
        evidence: [
            {
                id: "ev-1",
                type: "Photo",
                title: "Calming toolkit station setup",
                capturedAt: "Apr 3 · 02:15 PM",
                summary: "Selected weighted lap pad and breathing chime as favourite tools.",
            },
            {
                id: "ev-2",
                type: "Reflection",
                title: "Exit ticket · Body signals",
                capturedAt: "Mar 28 · 11:40 AM",
                summary: "Described noticing tight shoulders before noise feels overwhelming.",
            },
            {
                id: "ev-3",
                type: "Survey",
                title: "Guardian feedback pulse",
                capturedAt: "Apr 2 · 07:05 PM",
                summary: "Family reports improved transitions during homework block.",
            },
        ],
        interventions: [
            {
                id: "int-1",
                label: "Calming routine capture",
                owner: "Jo Walsh",
                due: "Apr 9",
                status: "Scheduled",
                description: "Record 60-second video of Avery modelling chosen calming sequence.",
            },
            {
                id: "int-2",
                label: "Guardian coaching call",
                owner: "Family Support Team",
                due: "Apr 11",
                status: "In progress",
                description: "Share home reinforcement ideas and align on evening routine cues.",
            },
        ],
        celebrations: [
            "Met baseline objective for identifying sensory preferences",
            "Consistent participation in regulation check-ins",
        ],
        focusAreas: [
            "Capture Module 2 evidence to unblock progression",
            "Increase student voice in reflection storytelling",
        ],
    },
    "noah-alvarez": {
        id: "noah-alvarez",
        name: "Noah Alvarez",
        grade: "Grade 3",
        path: "Self-Regulation Discovery",
        homeroom: "Sprout Cohort",
        teacher: "Ellie Summers",
        guardian: "Samara Alvarez",
        guardianContact: "(555) 402-1188",
        updatedAt: "Apr 7, 2025 · 04:15 PM",
        completion: 38,
        paceLabel: "1 lesson behind (Module 2)",
        mastery: 62,
        evidenceStreak: 2,
        summary:
            "Noah responds well to movement breaks and is beginning to articulate triggers. Needs structured prompts to document reflections.",
        modules: [
            {
                id: "module-1",
                title: "Sensory Welcome & Baseline",
                status: "On track",
                completion: 100,
                lastEvidence: "Mar 26 · Baseline rubric",
                outcomesMet: 3,
                outcomesTotal: 3,
                nextAction: "Share progress postcard home",
            },
            {
                id: "module-2",
                title: "Calming Toolkit Lab",
                status: "Watch",
                completion: 47,
                lastEvidence: "Apr 1 · Teacher note",
                outcomesMet: 1,
                outcomesTotal: 4,
                nextAction: "Upload student self reflection audio",
            },
            {
                id: "module-3",
                title: "Reflection Stories",
                status: "Watch",
                completion: 24,
                lastEvidence: "Planning stage",
                outcomesMet: 0,
                outcomesTotal: 4,
                nextAction: "Prep sentence stems for storytelling",
            },
        ],
        evidence: [
            {
                id: "ev-1",
                type: "Video",
                title: "Movement break routine",
                capturedAt: "Apr 2 · 09:05 AM",
                summary: "Demonstrated three-step breathing and stretching sequence.",
            },
            {
                id: "ev-2",
                type: "Reflection",
                title: "Check-in journal entry",
                capturedAt: "Apr 4 · 03:20 PM",
                summary: "Named transition challenges during arrival; suggested visual cues.",
            },
        ],
        interventions: [
            {
                id: "int-1",
                label: "Peer modeling session",
                owner: "Ellie Summers",
                due: "Apr 9",
                status: "Scheduled",
                description: "Pair with peer coach to rehearse calming narration.",
            },
        ],
        celebrations: [
            "Shared calming routine with peers during morning circle",
        ],
        focusAreas: [
            "Increase evidence uploads for Module 2",
            "Support independent reflection documentation",
        ],
    },
    "lina-patel": {
        id: "lina-patel",
        name: "Lina Patel",
        grade: "Grade 5",
        path: "Sensory Integration",
        homeroom: "Aurora Cohort",
        teacher: "Jordan Rivers",
        guardian: "Ravi Patel",
        guardianContact: "(555) 899-2441",
        updatedAt: "Apr 6, 2025 · 02:45 PM",
        completion: 55,
        paceLabel: "On pace (Module 2)",
        mastery: 74,
        evidenceStreak: 5,
        summary:
            "Lina is excelling in documenting experiences and offering peer coaching moments. Next step is stretching into Module 3 storytelling.",
        modules: [
            {
                id: "module-1",
                title: "Sensory Welcome & Baseline",
                status: "On track",
                completion: 100,
                lastEvidence: "Mar 27 · Baseline rubric",
                outcomesMet: 3,
                outcomesTotal: 3,
                nextAction: "Publish baseline capsule in portfolio",
            },
            {
                id: "module-2",
                title: "Calming Toolkit Lab",
                status: "On track",
                completion: 76,
                lastEvidence: "Apr 4 · Photo series",
                outcomesMet: 3,
                outcomesTotal: 4,
                nextAction: "Capture sensory preference reflection",
            },
            {
                id: "module-3",
                title: "Reflection Stories",
                status: "Watch",
                completion: 32,
                lastEvidence: "Apr 5 · Audio rehearsal",
                outcomesMet: 1,
                outcomesTotal: 4,
                nextAction: "Schedule storytelling recording session",
            },
        ],
        evidence: [
            {
                id: "ev-1",
                type: "Photo",
                title: "Calming choice board",
                capturedAt: "Apr 4 · 10:40 AM",
                summary: "Documented preferred tactile and auditory supports.",
            },
            {
                id: "ev-2",
                type: "Reflection",
                title: "Learning journal",
                capturedAt: "Apr 5 · 01:15 PM",
                summary: "Articulated how sound levels impact focus during math block.",
            },
            {
                id: "ev-3",
                type: "Video",
                title: "Peer coaching clip",
                capturedAt: "Apr 6 · 09:35 AM",
                summary: "Supported classmate in setting up calming station.",
            },
        ],
        interventions: [
            {
                id: "int-1",
                label: "Storyboarding workshop",
                owner: "Jordan Rivers",
                due: "Apr 9",
                status: "Scheduled",
                description: "Co-design storyboard for Module 3 narrative recording.",
            },
        ],
        celebrations: [
            "Led class in grounding routine during community circle",
            "Captured full week evidence streak",
        ],
        focusAreas: [
            "Finalize Module 2 outcome evidence",
            "Expand storytelling confidence for Module 3",
        ],
    },
};

const statusTone: Record<ModuleProgress["status"], "default" | "secondary" | "destructive"> = {
    "On track": "default",
    "Watch": "secondary",
    "Behind": "destructive",
};

export default function StudentProgressReport() {
    const {studentId} = useParams();

    const student = useMemo(() => {
        if (studentId && studentReports[studentId]) {
            return studentReports[studentId];
        }
        return studentReports["avery-chen"];
    }, [studentId]);

    const completionDelta = student.completion - 35; // illustrative comparison
    const masteryDelta = student.mastery - 65;

    return (
        <ReportLayout
            breadcrumbs={["Student Performance Reports", "Progress Tracking", student.name]}
            lead={`${student.path}`}
            title={`${student.name} · Progress`}
            description={student.summary}
            badges={[
                {label: student.grade},
                {label: student.homeroom},
                {label: `Updated ${student.updatedAt}`, variant: "outline"},
            ]}
            meta={[
                {label: "Teacher", value: student.teacher},
                {label: "Guardian", value: student.guardian},
                {label: "Contact", value: student.guardianContact},
            ]}
            actions={
                <>
                    <Button size="lg" className="gap-2">
                        <Download className="size-4" />
                        Export learner PDF
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2" asChild>
                        <Link to="/reports/progress-tracking">
                            <ArrowRight className="size-4" />
                            Back to cohort view
                        </Link>
                    </Button>
                </>
            }
        >
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Path completion</p>
                            <TrendingUp className="size-4 text-primary" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-semibold text-primary">{student.completion}%</span>
                            <Badge variant={completionDelta >= 0 ? "default" : "destructive"}>
                                {completionDelta >= 0 ? "+" : ""}
                                {completionDelta.toFixed(0)} pts vs cohort
                            </Badge>
                        </div>
                        <Progress value={student.completion} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <p className="text-sm font-medium text-muted-foreground">Mastery average</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-semibold text-primary">{student.mastery}%</span>
                            <Badge variant={masteryDelta >= 0 ? "default" : "destructive"}>
                                {masteryDelta >= 0 ? "+" : ""}
                                {masteryDelta.toFixed(0)} pts vs cohort
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Includes quiz performance and rubric-aligned outcomes.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <p className="text-sm font-medium text-muted-foreground">Evidence streak</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-semibold text-primary">{student.evidenceStreak}</span>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">days</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Encourage continued daily uploads for accelerated mastery gains.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <p className="text-sm font-medium text-muted-foreground">Pace check</p>
                        <Badge variant={student.paceLabel.includes("behind") ? "destructive" : "secondary"}>
                            {student.paceLabel}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                            Use scheduled interventions to close gaps and clear Module blockers.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Module progression</CardTitle>
                    <CardDescription>Review completion, evidence, and next actions for each module.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead className="w-40">Completion</TableHead>
                                <TableHead>Evidence last captured</TableHead>
                                <TableHead>Outcomes met</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Next action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {student.modules.map((module) => (
                                <TableRow key={module.id}>
                                    <TableCell className="font-medium text-primary">{module.title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{module.completion}%</span>
                                                <span>Goal 85%</span>
                                            </div>
                                            <Progress value={module.completion} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{module.lastEvidence}</TableCell>
                                    <TableCell>
                                        <div className="text-sm text-muted-foreground">
                                            {module.outcomesMet} / {module.outcomesTotal}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusTone[module.status]}>
                                            {module.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{module.nextAction}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Evidence highlights</CardTitle>
                        <CardDescription>Recent uploads and reflections that showcase growth.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {student.evidence.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "space-y-3",
                                    index !== student.evidence.length - 1 && "pb-4 border-b border-border/40",
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="uppercase tracking-wide text-xs">
                                        {item.type}
                                    </Badge>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {item.capturedAt}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="w-fit gap-2 text-primary">
                                    View evidence
                                    <ArrowUpRight className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming interventions</CardTitle>
                            <CardDescription>Aligned support moments to maintain pace.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {student.interventions.map((intervention) => (
                                <div key={intervention.id} className="space-y-2 rounded-lg border border-dashed border-border p-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary">{intervention.status}</Badge>
                                        <span className="text-xs font-medium text-muted-foreground">{intervention.due}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-primary">{intervention.label}</p>
                                    <p className="text-sm text-muted-foreground">{intervention.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Owner: <strong className="text-primary">{intervention.owner}</strong>
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                        <div className="px-6 pb-6">
                            <Button variant="ghost" size="sm" className="gap-2 text-primary">
                                <CalendarClock className="size-4" />
                                View meeting notes
                            </Button>
                        </div>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Celebrations & focus</CardTitle>
                            <CardDescription>Balance wins with the next stretch goals.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">Celebrations</span>
                                </div>
                                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                    {student.celebrations.map((celebration) => (
                                        <li key={celebration} className="flex items-start gap-2">
                                            <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
                                            <span>{celebration}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Separator />
                            <div>
                                <div className="flex items-center gap-2">
                                    <Target className="size-4 text-destructive" />
                                    <span className="text-sm font-semibold text-primary">Focus areas</span>
                                </div>
                                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                    {student.focusAreas.map((focus) => (
                                        <li key={focus} className="flex items-start gap-2">
                                            <AlertTriangle className="mt-0.5 size-3 text-destructive" />
                                            <span>{focus}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <div className="px-6 pb-6">
                            <Button variant="ghost" size="sm" className="gap-2 text-primary">
                                <MessageSquareText className="size-4" />
                                Draft family update
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Support log</CardTitle>
                    <CardDescription>Track coordination notes and follow-ups.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: Flag,
                            title: "Escalations",
                            value: "0 open",
                            description: "No open incidents. Continue weekly monitoring.",
                        },
                        {
                            icon: CalendarClock,
                            title: "Upcoming check-ins",
                            value: "2 scheduled",
                            description: "Facilitator + family touchpoint on Apr 11 and Apr 18.",
                        },
                        {
                            icon: MessageSquareText,
                            title: "Notes captured",
                            value: "5 this month",
                            description: "Summaries logged from calming toolkit sessions.",
                        },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="rounded-lg border border-dashed border-border p-4 space-y-2">
                                <Icon className="size-4 text-primary" />
                                <p className="text-sm font-semibold text-primary">{item.title}</p>
                                <p className="text-2xl font-semibold text-primary">{item.value}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </ReportLayout>
    );
}
