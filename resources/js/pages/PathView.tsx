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
import {Progress} from "@/components/ui/progress.tsx";
import {P} from "@/components/ui/typography/P.tsx";

const pathDetails = {
    title: "Multiplication Mastery Roadmap",
    subtitle: "A differentiated pathway guiding learners from conceptual understanding to fluent application.",
    subject: "Mathematics",
    gradeBand: "Grades 3 – 5",
    pacing: "6 Weeks",
    status: "Active",
    owner: "Jordan Rivers",
    lastUpdated: "March 15, 2024",
    enrollment: 128,
    proficiencyGain: "18% avg growth",
    completionRate: 72,
    publishing: {
        visibility: "School team",
        notifyTeam: true,
        releaseDate: "April 1, 2024",
    },
    modules: [
        {
            id: "module-1",
            title: "Number Sense Warm-Up",
            focus: "Diagnose prior knowledge with engaging mini-challenges.",
            duration: "Week 1",
            resources: 5,
            status: "In progress",
        },
        {
            id: "module-2",
            title: "Building Groups and Arrays",
            focus: "Connect repeated addition to real-world scenarios and tactile activities.",
            duration: "Week 2",
            resources: 8,
            status: "Starting soon",
        },
        {
            id: "module-3",
            title: "Visualizing Multiplication",
            focus: "Use area models and number lines to deepen conceptual understanding.",
            duration: "Week 3",
            resources: 6,
            status: "Scheduled",
        },
        {
            id: "module-4",
            title: "Strategy Studio",
            focus: "Learners choose and defend strategies that best fit the problem type.",
            duration: "Weeks 4-5",
            resources: 7,
            status: "Scheduled",
        },
        {
            id: "module-5",
            title: "Performance Showcase",
            focus: "Culminating project with peer feedback and self-reflection rubric.",
            duration: "Week 6",
            resources: 4,
            status: "Scheduled",
        },
    ],
    successCriteria: [
        "Students can flex between arrays, skip counting, and area models to solve problems.",
        "Weekly exit tickets show 80% mastery on fluency checks before moving forward.",
        "Families receive a showcase descriptor to celebrate growth publicly.",
    ],
    milestones: [
        {
            title: "Strategy Studio launch workshop",
            date: "Mar 28",
            type: "Session",
        },
        {
            title: "Family showcase night",
            date: "Apr 10",
            type: "Event",
        },
        {
            title: "Final reflection survey",
            date: "Apr 12",
            type: "Pulse",
        },
    ],
    insights: [
        {
            label: "Learners needing support",
            value: "9 students",
            trend: "Provide quick win tasks before Module 3.",
        },
        {
            label: "Celebrations",
            value: "21 badges earned",
            trend: "Announce during Monday community circle.",
        },
    ],
};

export default function PathView() {
    return (
        <div className="space-y-8">
            <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/20  border shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <Badge variant="secondary" className="w-fit uppercase tracking-wide">
                            {pathDetails.subject}
                        </Badge>
                        <div className="space-y-2">
                            <PageHeading lead={pathDetails.gradeBand} title={pathDetails.title}/>
                            <P className="max-w-2xl text-base text-muted-foreground">
                                {pathDetails.subtitle}
                            </P>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-primary">
                                {pathDetails.status}
                            </span>
                            <span>Owner: <strong>{pathDetails.owner}</strong></span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Updated {pathDetails.lastUpdated}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Pacing: {pathDetails.pacing}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <Button size="lg">Edit path</Button>
                        <Button variant="outline" size="lg">
                            Share overview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex flex-1 flex-col gap-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="space-y-2 p-6">
                                <P className="text-sm text-muted-foreground">Current completion</P>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-primary">{pathDetails.completionRate}%</span>
                                    <Badge variant="outline">+8% WoW</Badge>
                                </div>
                                <Progress value={pathDetails.completionRate}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="space-y-2 p-6">
                                <P className="text-sm text-muted-foreground">Active learners</P>
                                <span className="text-3xl font-semibold text-primary">{pathDetails.enrollment}</span>
                                <P className="text-xs text-muted-foreground">Across three homerooms</P>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="space-y-2 p-6">
                                <P className="text-sm text-muted-foreground">Proficiency gain</P>
                                <span className="text-3xl font-semibold text-primary">{pathDetails.proficiencyGain}</span>
                                <P className="text-xs text-muted-foreground">Average pre/post diagnostic movement</P>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Learning journey</CardTitle>
                            <CardDescription>A curated progression designed for momentum and celebration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <ol className="space-y-6">
                                {pathDetails.modules.map((module, index) => (
                                    <li key={module.id} className="relative pl-6">
                                        {index !== pathDetails.modules.length - 1 && (
                                            <span className="absolute left-[9px] top-6 h-full w-px bg-border" aria-hidden/>
                                        )}
                                        <span className="absolute left-0 top-1 flex size-4 items-center justify-center rounded-full border border-primary bg-background text-xs font-semibold text-primary">
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-primary">{module.title}</h3>
                                                    <P className="text-sm text-muted-foreground">{module.focus}</P>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                                                    <Badge variant="secondary">{module.duration}</Badge>
                                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                                        {module.status}
                                                    </span>
                                                    <span className="text-muted-foreground">{module.resources} resources</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Success criteria</CardTitle>
                            <CardDescription>Outcomes we monitor to know the path is landing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                                {pathDetails.successCriteria.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-primary"/>
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:w-80">
                    <div className="flex w-full flex-col gap-6 rounded-xl bg-gray-100 p-5">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-primary">Published</h3>
                                <P className="text-sm text-muted-foreground">
                                    Visibility and rollout details mirrored from the creation flow.
                                </P>
                            </div>
                            <Separator/>
                            <dl className="space-y-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Visibility</dt>
                                    <dd className="font-medium text-foreground">{pathDetails.publishing.visibility}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Path owner</dt>
                                    <dd className="font-medium text-foreground">{pathDetails.owner}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Notify instructional team</dt>
                                    <dd className="font-medium text-foreground">
                                        {pathDetails.publishing.notifyTeam ? "Enabled" : "Disabled"}
                                    </dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Planned release date</dt>
                                    <dd className="font-medium text-foreground">{pathDetails.publishing.releaseDate}</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="rounded-lg border border-primary/20 bg-white/80 p-4 text-xs text-muted-foreground">
                            Pro tip: align the release date with homeroom communications so families can preview the
                            journey.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
