import PageHeading from "@/components/ui/PageHeading.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    CalendarCheck,
    CalendarClock,
    Download,
    ListChecks,
    MessageSquareText,
    type LucideIcon,
} from "lucide-react";
import {Link} from "react-router-dom";

type ReportSection = {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    focusLabel: string;
    icon: LucideIcon;
    metrics: Array<{
        title: string;
        description: string;
    }>;
    footer?: string;
    fullWidth?: boolean;
    ctas?: Array<{
        label: string;
        to: string;
        variant?: "default" | "outline" | "secondary" | "ghost";
    }>;
};

const reportSections: ReportSection[] = [
    {
        id: "student-performance",
        title: "Student Performance Reports",
        shortTitle: "Performance",
        description: "Measure mastery and pinpoint growth opportunities for every learner.",
        focusLabel: "Mastery tracking",
        icon: BarChart3,
        metrics: [
            {
                title: "Grades and assessments",
                description: "View scores by assignment, quiz, module, or custom rubric.",
            },
            {
                title: "Progress tracking",
                description: "Monitor completion status across courses, paths, and units.",
            },
            {
                title: "Learning outcomes mapping",
                description: "See which competencies or objectives each student has met or missed.",
            },
            {
                title: "Trend analysis",
                description: "Spot improvement or decline over time at student and class levels.",
            },
        ],
        footer: "Ideal for data meetings and sharing mastery snapshots with caregivers.",
        ctas: [
            {
                label: "Open progress tracking",
                to: "/reports/progress-tracking",
                variant: "outline",
            },
        ],
    },
    {
        id: "engagement-activity",
        title: "Engagement & Activity Reports",
        shortTitle: "Engagement",
        description: "Surface usage signals to catch quiet disengagement before it grows.",
        focusLabel: "Engagement pulse",
        icon: Activity,
        metrics: [
            {
                title: "Login frequency and duration",
                description: "Identify learners who are consistently active—or silently ghosting.",
            },
            {
                title: "Resource usage",
                description: "Track which videos, readings, or forums spark attention (or are ignored).",
            },
            {
                title: "Discussion participation",
                description: "Quantify forum posts, peer reviews, and collaborative touchpoints.",
            },
        ],
        footer: "Blend with communication nudges to re-engage learners in real time.",
    },
    {
        id: "attendance-participation",
        title: "Attendance & Participation Reports",
        shortTitle: "Attendance",
        description: "Unify hybrid attendance logs with live participation signals.",
        focusLabel: "Presence insights",
        icon: CalendarCheck,
        metrics: [
            {
                title: "Session attendance",
                description: "Review virtual and in-person presence with quick filtering by cohort.",
            },
            {
                title: "Participation metrics",
                description: "Capture engagement in polls, chats, breakout rooms, and check-ins.",
            },
        ],
        footer: "Sync with guardians and administrators when absence patterns emerge.",
    },
    {
        id: "assessment-analytics",
        title: "Assessment Analytics Reports",
        shortTitle: "Assessments",
        description: "Dive deep into question-level performance for instructional refinement.",
        focusLabel: "Formative insights",
        icon: ListChecks,
        metrics: [
            {
                title: "Question analysis",
                description: "Highlight items most frequently missed to flag instructional gaps.",
            },
            {
                title: "Average completion time",
                description: "Detect pacing issues and identify lessons that need scaffolds.",
            },
            {
                title: "Item discrimination",
                description: "Understand which questions differentiate strong and struggling learners.",
            },
        ],
        footer: "Pair with reteach plans or PLC conversations on assessment quality.",
    },
    {
        id: "feedback-communication",
        title: "Feedback & Communication Reports",
        shortTitle: "Feedback",
        description: "Bring together sentiment, messaging cadence, and response follow-through.",
        focusLabel: "Family dialogue",
        icon: MessageSquareText,
        metrics: [
            {
                title: "Feedback summaries",
                description: "Aggregate survey scores and qualitative comments for trend spotting.",
            },
            {
                title: "Communication logs",
                description: "Track messages sent, unread notifications, and teacher follow-ups.",
            },
        ],
        footer: "Close the loop on student support with timely feedback cycles.",
        fullWidth: true,
    },
];

export default function Reports() {
    return (
        <div className="space-y-8 text-primary">
            <Card className="overflow-hidden border-none bg-gradient-to-r from-primary/10 via-primary/5 to-primary/20 shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <PageHeading lead="Insights" title="Reports & Analytics" />
                        <p className="max-w-2xl text-base text-muted-foreground">
                            Build the story behind every learner with performance, engagement, attendance, assessment, and feedback lenses.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {reportSections.map((section) => (
                                <Badge
                                    key={section.id}
                                    variant="secondary"
                                    className="bg-white/80 text-primary"
                                >
                                    {section.shortTitle}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button size="lg" className="gap-2">
                            <Download className="size-4" />
                            Export snapshot
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2">
                            <CalendarClock className="size-4" />
                            Schedule digest
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
                {reportSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={section.id}
                            className={cn("h-full", section.fullWidth ? "xl:col-span-2" : "")}
                        >
                            <CardHeader className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                                        <Icon className="size-5" />
                                    </span>
                                    <div className="space-y-2">
                                        <CardTitle>{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="w-fit uppercase tracking-wide">
                                    {section.focusLabel}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {section.metrics.map((metric) => (
                                        <div
                                            key={metric.title}
                                            className="rounded-lg border border-dashed border-border bg-muted/20 p-4"
                                        >
                                            <p className="text-sm font-semibold text-primary">
                                                {metric.title}
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {metric.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {section.footer && (
                                    <>
                                        <Separator />
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {section.footer}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                            {section.ctas?.length ? (
                                <CardFooter className="justify-end gap-3">
                                    {section.ctas.map((cta) => (
                                        <Button
                                            key={cta.label}
                                            variant={cta.variant ?? "outline"}
                                            size="sm"
                                            asChild
                                            className="gap-2"
                                        >
                                            <Link to={cta.to}>
                                                {cta.label}
                                                <ArrowUpRight className="size-3.5" />
                                            </Link>
                                        </Button>
                                    ))}
                                </CardFooter>
                            ) : null}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
