import {useMemo} from "react";
import {Link} from "react-router-dom";
// import {useParams} from "react-router-dom";
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
import {ArrowRight, FileText} from "lucide-react";

const moduleDetails = {
    code: "MOD-EXPLR-001",
    title: "Sensory Exploration Foundations",
    status: "Published",
    version: "v1.2 · Spring refresh",
    updatedAt: "April 8, 2025",
    summary:
        "A five-lesson journey that helps learners notice, name, and regulate sensory input through guided exploration, reflection, and playful practice.",
    objectives: [
        "Build common vocabulary for the five core senses.",
        "Introduce calming techniques that learners can practice independently.",
        "Capture evidence of sensory preferences to inform personalised learning plans.",
    ],
    prerequisites: [
        "Baseline sensory assessment completed",
        "Sensory toolkit prepared (textured squares, scented markers, noise-cancelling headphones)",
    ],
    difficulty: "Beginner",
    duration: "6 hours · 5 sessions",
    learningType: "Hands-on",
    tags: ["Sensory integration", "Self-regulation", "Communication"],
    progressTracking:
        "Daily micro-checkpoints captured by teachers and summarised in a weekly reflection, with visual progress charts shared to the parent portal.",
    completionCriteria:
        "All lessons marked complete, reflection journal submitted, and final sensory preference profile updated in the student record.",
    feedbackStrategy:
        "Teacher reflections captured in-app, parent feedback requested via automated prompt two days after the final lesson.",
    author: {
        name: "Alex Rivera",
        role: "Lead Occupational Therapist",
        bio: "Designs play-first interventions that blend sensory integration with social narratives.",
        contactLinks: [
            {label: "Email", href: "mailto:alex.rivera@example.com"},
            {label: "LinkedIn", href: "https://www.linkedin.com/in/alex-rivera"},
        ],
    },
    access: "Grade 3 Sensory Pathway educators, programme administrators",
    lessons: [
        {
            id: "lesson-sensory-baseline",
            order: 1,
            title: "Sensory Welcome & Baseline",
            focus:
                "Introduces the class to the sensory toolkit, sets expectations, and captures a quick baseline check using visual emotion cards.",
            outcomes: [
                "Learners can name each sense and share one preferred stimulus.",
                "Teacher records first impressions in the observation log.",
            ],
            materials: [
                {name: "Lesson Slides", type: "pdf", size: "1.8 MB", url: "#"},
                {
                    name: "Classroom Setup Reference",
                    type: "image",
                    size: "640 KB",
                    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
                },
            ],
        },
        {
            id: "lesson-calming-toolkit",
            order: 2,
            title: "Calming Toolkit Lab",
            focus:
                "Learners experiment with tactile, auditory, and visual stations to practise calming techniques and identify personal favourites.",
            outcomes: [
                "Each learner documents a calming technique they enjoyed.",
                "Teacher captures short video snippets for evidence.",
            ],
            materials: [
                {name: "Station Cards", type: "pdf", size: "950 KB", url: "#"},
                {
                    name: "Calming Toolkit Demo",
                    type: "video",
                    size: "45 MB",
                    url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
                },
            ],
        },
        {
            id: "lesson-reflection-stories",
            order: 3,
            title: "Reflection Stories",
            focus:
                "Students craft mini-stories about their sensory experiences using prompts and role-play, documenting moments of challenge and success.",
            outcomes: [
                "Learners articulate how the environment impacts their focus and comfort.",
                "Teacher highlights strategies to carry into future modules.",
            ],
            materials: [
                {
                    name: "Story Prompt Cards",
                    type: "image",
                    size: "540 KB",
                    url: "https://images.unsplash.com/photo-1510936111840-65e151ad71bb?auto=format&fit=crop&w=600&q=80",
                },
            ],
        },
    ],
};

const typeToBadgeVariant: Record<string, { label: string; variant?: "default" | "secondary" | "outline" }> = {
    pdf: {label: "PDF", variant: "secondary"},
    image: {label: "Image"},
    video: {label: "Video", variant: "outline"},
    audio: {label: "Audio", variant: "outline"},
    default: {label: "File", variant: "outline"},
};

export default function ModuleView() {
    // const {id} = useParams();

    const computedStatusTone = useMemo(() => {
        if (moduleDetails.status.toLowerCase() === "published") {
            return "default" as const;
        }
        if (moduleDetails.status.toLowerCase() === "draft") {
            return "secondary" as const;
        }
        return "outline" as const;
    }, []);

    return (
        <div className="space-y-8">
            <Card
                className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/20 border shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <Badge variant={computedStatusTone} className="w-fit uppercase tracking-wide">
                            {moduleDetails.status}
                        </Badge>
                        <div className="space-y-3 text-primary">
                            <PageHeading
                                lead={`Module · ${moduleDetails.code}`}
                                title={moduleDetails.title}
                            />
                            <p className="max-w-2xl text-base text-muted-foreground">
                                {moduleDetails.summary}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-primary">
                                {moduleDetails.status}
                            </span>
                            <span>Version: <strong>{moduleDetails.version}</strong></span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Updated {moduleDetails.updatedAt}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Difficulty: {moduleDetails.difficulty}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Duration: {moduleDetails.duration}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <Button size="lg">Edit Module</Button>
                        <Button variant="outline" size="lg">
                            Share overview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-6 xl:flex-row">
                <div className="flex w-full flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blueprint summary</CardTitle>
                            <CardDescription>What the module guarantees and how it sets the stage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learning
                                    objectives</h3>
                                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                                    {moduleDetails.objectives.map((objective) => (
                                        <li key={objective} className="flex items-start gap-2">
                                            <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary"/>
                                            <span>{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prerequisites</h4>
                                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                        {moduleDetails.prerequisites.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</h4>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {moduleDetails.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="bg-muted/40">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson timeline</CardTitle>
                            <CardDescription>How the learning experience unfolds across sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-6">
                                {moduleDetails.lessons.map((lesson, index) => (
                                    <li key={lesson.title} className="relative pl-6">
                                        {index !== moduleDetails.lessons.length - 1 && (
                                            <span className="absolute left-[9px] top-6 h-full w-px bg-border"
                                                  aria-hidden/>
                                        )}
                                        <span
                                            className="absolute left-0 top-1 flex size-4 items-center justify-center rounded-full border border-primary bg-background text-xs font-semibold text-primary">
                                            {index + 1}
                                        </span>
                                        <div
                                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-semibold text-primary">{lesson.title}</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{lesson.focus}</p>
                                                </div>
                                                <Badge
                                                    variant="secondary">Lesson {String(lesson.order).padStart(2, "0")}</Badge>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcomes</h4>
                                                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                                                    {lesson.outcomes.map((outcome) => (
                                                        <li key={outcome} className="flex items-start gap-2">
                                                            <span
                                                                className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary/70"/>
                                                            <span>{outcome}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {lesson.materials.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lesson
                                                        materials</h4>
                                                    <ul className="flex flex-col gap-2">
                                                        {lesson.materials.map((asset) => {
                                                            const badgeMeta = typeToBadgeVariant[asset.type] || typeToBadgeVariant.default;
                                                            const isImage = asset.type === "image";

                                                            return (
                                                                <li
                                                                    key={`${lesson.title}-${asset.name}`}
                                                                    className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="size-10 rounded-md overflow-hidden bg-white/60 flex items-center justify-center">
                                                                            {isImage ? (
                                                                                <img
                                                                                    src={asset.url}
                                                                                    alt={asset.name}
                                                                                    className="size-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <FileText className="size-5 text-primary" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <p className="text-sm font-medium leading-tight text-foreground break-all">
                                                                                {asset.name}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <Badge variant={badgeMeta.variant}>{badgeMeta.label}</Badge>
                                                                                <span>{asset.size}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="ghost" size="sm" className="px-2" asChild>
                                                                        <a
                                                                            href={asset.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Preview
                                                                        </a>
                                                                    </Button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
                                            <Button variant="outline" size="sm" className="mt-3 w-fit gap-2" asChild>
                                                <Link to={`/lessons/${lesson.id}`}>
                                                    Open lesson
                                                    <ArrowRight className="size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:w-80">
                    <div className="flex w-full flex-col gap-6 rounded-xl bg-gray-100 p-5">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-primary">Engagement & tracking</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                How educators monitor momentum and signal completion.
                            </p>
                        </div>
                        <Separator/>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress
                                    tracking</h4>
                                <p className="mt-1 text-foreground leading-relaxed">{moduleDetails.progressTracking}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion
                                    criteria</h4>
                                <p className="mt-1 text-foreground leading-relaxed">{moduleDetails.completionCriteria}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feedback
                                    & rating</h4>
                                <p className="mt-1 text-foreground leading-relaxed">{moduleDetails.feedbackStrategy}</p>
                            </div>
                        </div>
                    </div>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Ownership & access</CardTitle>
                            <CardDescription>Administrative signals carried over from creation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Author</h4>
                                <p className="mt-1 text-base font-semibold text-foreground">{moduleDetails.author.name}</p>
                                <p>{moduleDetails.author.role}</p>
                                <p>{moduleDetails.author.bio}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {moduleDetails.author.contactLinks.map((link) => (
                                    <Button key={link.href} variant="outline" size="sm" asChild>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                                            {link.label}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                            <Separator/>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access
                                    control</h4>
                                <p className="mt-1 text-foreground leading-relaxed">{moduleDetails.access}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
