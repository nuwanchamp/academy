import PageHeading from "@/components/ui/PageHeading.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {
    Progress,
} from "@/components/ui/progress.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Clock3,
    FileText,
    Lightbulb,
    ListChecks,
    PlayCircle,
    Target,
    Users,
    Wand2,
} from "lucide-react";
import {Link} from "react-router-dom";

type LessonSegment = {
    id: string;
    title: string;
    duration: string;
    intention: string;
    steps: string[];
    facilitatorTips: string[];
};

type LessonAttachment = {
    name: string;
    type: string;
    size: string;
    url: string;
};

type DifferentiationStrategy = {
    name: string;
    description: string;
    tags: string[];
};

const lessonDetails = {
    id: "lesson-sensory-baseline",
    moduleCode: "MOD-EXPLR-001",
    moduleTitle: "Sensory Exploration Foundations",
    moduleSlug: "sensory-exploration-foundations",
    sequence: "Lesson 01 · Welcome & Baseline",
    status: "Active",
    duration: "45 minutes",
    updatedAt: "April 8, 2025",
    summary:
        "Set expectations, co-create norms, and capture a baseline snapshot of how learners notice and name sensory input before diving into the full pathway.",
    essentialQuestion: "How does our environment influence what we notice, feel, and do?",
    objectives: [
        "Build shared language around the five core senses.",
        "Capture each learner’s preferred sensory inputs and regulation comfort items.",
        "Model reflection prompts that will return across the module.",
    ],
    successCriteria: [
        "Learners can identify at least two sensory preferences using provided visuals.",
        "Teacher captures baseline notes per learner for follow-up conferences.",
        "Class co-creates norms for trying calming strategies together.",
    ],
    keyMetrics: {
        completion: 78,
        evidenceUploads: 19,
        reflectionsLogged: 12,
    },
    attachments: [
        {
            name: "Lesson facilitation guide.pdf",
            type: "PDF",
            size: "1.8 MB",
            url: "#",
        },
        {
            name: "Sensory toolkit preview.mp4",
            type: "Video",
            size: "45 MB",
            url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        },
        {
            name: "Norm setting prompt cards.png",
            type: "Image",
            size: "640 KB",
            url: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&w=600&q=80",
        },
    ] satisfies LessonAttachment[],
    segments: [
        {
            id: "arrival-norms",
            title: "Arrival & sensory norms",
            duration: "10 min",
            intention: "Welcome learners with predictable routines and co-design safety norms.",
            steps: [
                "Greet learners with calm music and invite them to choose a sensory welcome card.",
                "Introduce the day’s essential question and co-create two community agreements.",
                "Log initial feelings check-in in the observation dashboard.",
            ],
            facilitatorTips: [
                "Model the language you expect learners to use when naming sensory preferences.",
                "Capture photos of co-created norms for later reference.",
            ],
        },
        {
            id: "stations-explore",
            title: "Sensory station exploration",
            duration: "20 min",
            intention: "Allow learners to rotate through tactile, auditory, and visual experiences.",
            steps: [
                "Assign learners to triads and rotate every six minutes.",
                "Prompt learners to document one preferred stimulus at each station.",
                "Record notes in the baseline template focusing on regulation responses.",
            ],
            facilitatorTips: [
                "Use timers with gentle chimes to ease transitions.",
                "Prompt quieter students with specific observations to encourage voice.",
            ],
        },
        {
            id: "reflection-circle",
            title: "Reflection circle",
            duration: "15 min",
            intention: "Synthesize takeaways and capture baseline evidence for the module.",
            steps: [
                "Gather learners in a circle using visual reflection prompts.",
                "Invite volunteers to share how a stimulus changed their focus or comfort.",
                "Close with journaling: learners draw or write their preferred calming setup.",
            ],
            facilitatorTips: [
                "Provide optional sentence stems for emerging communicators.",
                "Photograph journal entries to store in the evidence log.",
            ],
        },
    ] satisfies LessonSegment[],
    differentiation: [
        {
            name: "Sensory buddy system",
            description: "Pair learners to observe one another and record cues collaboratively.",
            tags: ["Collaboration", "Peer coaching"],
        },
        {
            name: "Choice-based reflection",
            description: "Allow learners to demonstrate understanding via drawing, audio, or manipulatives.",
            tags: ["UDL", "Voice & choice"],
        },
        {
            name: "Quiet corner toolkit",
            description: "Offer a self-regulation station with visuals for learners needing a reset.",
            tags: ["Regulation", "De-escalation"],
        },
    ] satisfies DifferentiationStrategy[],
    evidencePlan: {
        instruments: [
            "Baseline observation checklist",
            "Student reflection journal",
            "Sensory preference capture form",
        ],
        expectations: [
            "Upload at least one artifact per learner to the module evidence board.",
            "Tag observations with the appropriate competency (Awareness, Regulation).",
            "Flag learners needing follow-up for small group coaching in next lesson.",
        ],
    },
    nextLesson: {
        id: "lesson-calming-toolkit",
        title: "Calming Toolkit Lab",
        focus: "Learners experiment with tactile, auditory, and visual stations to practise calming techniques and identify personal favourites.",
    },
    previousLesson: undefined,
};

export default function LessonView() {
    return (
        <div className="space-y-8 text-primary">
            <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/20 border-none shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <Badge variant="secondary" className="w-fit uppercase tracking-wide">
                            {lessonDetails.sequence}
                        </Badge>
                        <div className="space-y-3 text-primary">
                            <PageHeading lead={`Module · ${lessonDetails.moduleCode}`} title={lessonDetails.moduleTitle} />
                            <p className="max-w-2xl text-base text-muted-foreground">
                                {lessonDetails.summary}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-primary">
                                {lessonDetails.status}
                            </span>
                            <span>Duration: <strong>{lessonDetails.duration}</strong></span>
                            <Separator orientation="vertical" className="h-4 bg-white/70" />
                            <span>Updated {lessonDetails.updatedAt}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <Button size="lg">Edit lesson</Button>
                        <Button variant="outline" size="lg" className="gap-2" asChild>
                            <Link to={`/modules/${lessonDetails.moduleSlug}`}>
                                <BookOpen className="size-4" />
                                View module
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Learning outcomes & success criteria</CardTitle>
                        <CardDescription>Clarify what mastery looks like for this experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="size-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Objectives</span>
                            </div>
                            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                                {lessonDetails.objectives.map((objective) => (
                                    <li key={objective} className="flex items-start gap-2">
                                        <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ListChecks className="size-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Success criteria</span>
                            </div>
                            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                                {lessonDetails.successCriteria.map((criteria) => (
                                    <li key={criteria} className="flex items-start gap-2">
                                        <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary/70" />
                                        <span>{criteria}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lesson pulse</CardTitle>
                        <CardDescription>Capture quick metrics to track lesson health.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Completion</span>
                                <span>{lessonDetails.keyMetrics.completion}%</span>
                            </div>
                            <Progress value={lessonDetails.keyMetrics.completion} />
                        </div>
                        <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 text-primary">
                                <Users className="size-4" />
                                <span className="font-semibold">Evidence uploads</span>
                            </div>
                            <p className="mt-1 text-base text-primary">{lessonDetails.keyMetrics.evidenceUploads}</p>
                            <p>Artifacts captured across cohorts this week.</p>
                        </div>
                        <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 text-primary">
                                <Lightbulb className="size-4" />
                                <span className="font-semibold">Reflections logged</span>
                            </div>
                            <p className="mt-1 text-base text-primary">{lessonDetails.keyMetrics.reflectionsLogged}</p>
                            <p>Learners who completed the closing reflection prompt.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Instructional flow</CardTitle>
                    <CardDescription>Step-by-step guide to facilitate each part of the lesson.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {lessonDetails.segments.map((segment, index) => (
                        <div
                            key={segment.id}
                            className={cn(
                                "rounded-xl border border-border bg-card p-5 shadow-sm",
                                index !== lessonDetails.segments.length - 1 && "border-b border-dashed border-border pb-6",
                            )}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Clock3 className="size-3.5" />
                                        {segment.duration}
                                    </div>
                                    <h3 className="text-lg font-semibold text-primary">{segment.title}</h3>
                                    <p className="text-sm text-muted-foreground">{segment.intention}</p>
                                </div>
                                <Badge variant="secondary" className="bg-muted/30 text-primary">
                                    Segment {index + 1}
                                </Badge>
                            </div>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Facilitation steps
                                    </h4>
                                    <ol className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                                        {segment.steps.map((step) => (
                                            <li key={step} className="flex items-start gap-2">
                                                <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Facilitator prompts
                                    </h4>
                                    <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                        {segment.facilitatorTips.map((tip) => (
                                            <li key={tip} className="flex items-start gap-2">
                                                <PlayCircle className="mt-0.5 size-3 text-primary" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Materials & media</CardTitle>
                        <CardDescription>Resources learners and facilitators need ready to go.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead className="text-right">Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lessonDetails.attachments.map((attachment) => (
                                    <TableRow key={attachment.name}>
                                        <TableCell className="font-medium text-primary">{attachment.name}</TableCell>
                                        <TableCell>{attachment.type}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {attachment.type === "PDF" && "Facilitation guide"}
                                            {attachment.type === "Video" && "Preview loop for stations"}
                                            {attachment.type === "Image" && "Norm prompt visuals"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="gap-2 text-primary" asChild>
                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="size-4" />
                                                    {attachment.size}
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Differentiation & supports</CardTitle>
                        <CardDescription>Optional scaffolds to personalise the experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lessonDetails.differentiation.map((strategy) => (
                            <div key={strategy.name} className="rounded-lg border border-dashed border-border p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="size-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">{strategy.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{strategy.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {strategy.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="bg-muted/40 text-xs uppercase tracking-wide">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Evidence & follow-up</CardTitle>
                    <CardDescription>Ensure data capture aligns with module competencies.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Instruments
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {lessonDetails.evidencePlan.instruments.map((instrument) => (
                                <li key={instrument} className="flex items-start gap-2">
                                    <ListChecks className="mt-0.5 size-3.5 text-primary" />
                                    <span>{instrument}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Expectations
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {lessonDetails.evidencePlan.expectations.map((expectation) => (
                                <li key={expectation} className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 size-3.5 text-destructive" />
                                    <span>{expectation}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-4 items-center justify-between text-center md:flex-row md:text-left">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Next in this module
                        </p>
                        <h3 className="text-lg font-semibold text-primary">{lessonDetails.nextLesson.title}</h3>
                        <p className="text-sm text-muted-foreground max-w-xl">
                            {lessonDetails.nextLesson.focus}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row">
                        {lessonDetails.previousLesson ? (
                            <Button variant="ghost" className="gap-2" asChild>
                                <Link to={`/lessons/${lessonDetails.previousLesson.id}`}>
                                    Back to previous lesson
                                </Link>
                            </Button>
                        ) : null}
                        <Button className="gap-2" asChild>
                            <Link to={`/lessons/${lessonDetails.nextLesson.id}`}>
                                Continue to next lesson
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
