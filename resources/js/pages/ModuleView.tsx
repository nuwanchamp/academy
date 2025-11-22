import {useMemo} from "react";
import {Link, useParams} from "react-router-dom";
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
import {useModule} from "@/features/modules/hooks/useModule.ts";

const typeToBadgeVariant: Record<string, { label: string; variant?: "default" | "secondary" | "outline" }> = {
    pdf: {label: "PDF", variant: "secondary"},
    image: {label: "Image"},
    video: {label: "Video", variant: "outline"},
    audio: {label: "Audio", variant: "outline"},
    default: {label: "File", variant: "outline"},
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(undefined, {month: "long", day: "numeric", year: "numeric"}).format(parsed);
};

const startCase = (value?: string | null) => {
    if (!value) return "—";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function ModuleView() {
    const {id} = useParams<{id: string}>();
    const {module, isLoading, error, reload} = useModule(id);

    const moduleDetails = useMemo(() => {
        if (!module) {
            return {
                code: "—",
                title: "Module",
                status: "draft",
                version_label: "",
                updated_at: null,
                summary: "",
                objectives: [],
                prerequisites: [],
                difficulty: "",
                estimated_duration: "",
                learning_type: "",
                tags: [],
                progress_tracking: "",
                completion_criteria: "",
                feedback_strategy: "",
                access_control: "",
                lessons: [],
                authors: [],
            };
        }
        return module;
    }, [module]);

    const computedStatusTone = useMemo(() => {
        const statusValue = (moduleDetails.status ?? "").toLowerCase();
        if (statusValue === "published") {
            return "default" as const;
        }
        if (statusValue === "draft") {
            return "secondary" as const;
        }
        return "outline" as const;
    }, [moduleDetails.status]);

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/20">
                <CardContent className="py-12 text-center text-primary">
                    <CardTitle>Loading module…</CardTitle>
                    <CardDescription>Fetching the latest details.</CardDescription>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-destructive">Unable to load module</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={reload}>
                        Try again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <Card
                className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/20 border shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <Badge variant={computedStatusTone} className="w-fit uppercase tracking-wide">
                            {startCase(moduleDetails.status)}
                        </Badge>
                        <div className="space-y-3 text-primary">
                            <PageHeading
                                lead={`Module · ${moduleDetails.code}`}
                                title={moduleDetails.title}
                            />
                            <p className="max-w-2xl text-base text-muted-foreground">
                                {moduleDetails.summary || "No summary provided yet."}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-primary">
                                {startCase(moduleDetails.status)}
                            </span>
                            <span>Version: <strong>{moduleDetails.version_label ?? "—"}</strong></span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Updated {formatDate(moduleDetails.updated_at)}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Difficulty: {moduleDetails.difficulty ?? "—"}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Duration: {moduleDetails.estimated_duration ?? "—"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <Button size="lg" asChild>
                            <Link to={`/modules/${moduleDetails.id ?? id}/edit`}>Edit Module</Link>
                        </Button>
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
                                    {(moduleDetails.objectives ?? ["No objectives documented."]).map((objective, idx) => (
                                        <li key={`${objective}-${idx}`} className="flex items-start gap-2">
                                            <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary"/>
                                            <span>{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prerequisites</h4>
                                    <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                        {(moduleDetails.prerequisites ?? ["Not specified."]).map((item, idx) => (
                                            <li key={`${item}-${idx}`} className="flex items-start gap-2">
                                                <ArrowRight className="mt-0.5 h-3 w-3" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress tracking</h4>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {moduleDetails.progress_tracking || "Describe how progress is captured for this module."}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion criteria</h4>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {moduleDetails.completion_criteria || "Set clear completion rules for learners and staff."}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Feedback strategy</h4>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {moduleDetails.feedback_strategy || "Document how feedback is gathered and shared."}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-dashed border-border p-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Access control</h4>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {moduleDetails.access_control || "Specify who can view or edit this module."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lessons</CardTitle>
                            <CardDescription>Sequence of learning experiences inside this module.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(moduleDetails.lessons ?? []).map((lesson) => (
                                <div key={lesson.id} className="rounded-xl border border-border p-4">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs uppercase text-muted-foreground">Lesson {lesson.sequence_order}</p>
                                            <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                                        </div>
                                        <Badge variant="secondary">Sequence {lesson.sequence_order}</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{lesson.summary ?? "No summary provided."}</p>

                                    {lesson.objectives && lesson.objectives.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objectives</p>
                                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                                {lesson.objectives.map((objective, idx) => (
                                                    <li key={`${objective}-${idx}`}>{objective}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {lesson.outcomes && lesson.outcomes.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcomes</p>
                                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                                {lesson.outcomes.map((outcome, idx) => (
                                                    <li key={`${outcome}-${idx}`}>{outcome}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {(lesson.materials?.length ?? 0) > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Materials</p>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {lesson.materials?.map((material) => {
                                                    const badge = typeToBadgeVariant[material.file_type ?? "default"] ?? typeToBadgeVariant.default;
                                                    return (
                                                        <div key={material.id ?? material.name} className="rounded-lg border border-border p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-sm text-foreground">{material.name}</span>
                                                                </div>
                                                                <Badge variant={badge.variant ?? "outline"}>{badge.label}</Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {material.file_size_bytes ? `${Math.round(material.file_size_bytes / 1024)} KB` : ""}
                                                            </p>
                                                            {material.external_url && (
                                                                <a
                                                                    href={material.external_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-primary underline"
                                                                >
                                                                    Open asset
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(moduleDetails.lessons?.length ?? 0) === 0 && (
                                <p className="text-sm text-muted-foreground">Lessons will appear here once added.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex w-full flex-col gap-4 xl:w-1/3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                            <CardDescription>
                                Who it serves and how it’s positioned.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Subject</Badge>
                                <span>{moduleDetails.subject ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Grade band</Badge>
                                <span>{moduleDetails.grade_band ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Learning type</Badge>
                                <span>{moduleDetails.learning_type ?? "—"}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(moduleDetails.tags ?? []).map((tag) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Authors</CardTitle>
                            <CardDescription>Who shaped this module.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            {(moduleDetails.authors ?? []).map((author) => (
                                <div key={author.id ?? author.name} className="rounded-lg border border-border p-3">
                                    <p className="text-foreground font-medium">{author.name}</p>
                                    <p>{author.role ?? "Author"}</p>
                                    {author.bio && <p className="mt-2 text-xs">{author.bio}</p>}
                                    {(author.contact_links ?? []).map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 block text-xs text-primary underline"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            ))}
                            {(moduleDetails.authors?.length ?? 0) === 0 && (
                                <p className="text-sm">No authors recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
