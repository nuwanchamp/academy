import {useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Loader2} from "lucide-react";
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
import {P} from "@/components/ui/typography/P.tsx";
import {fetchPath} from "@/features/paths/services/pathApi.ts";
import type {PathDetail, PathModuleSummary} from "@/features/paths/types/path.ts";

const formatStatus = (status?: string | null) => {
    if (status === "published") return "Published";
    if (status === "archived") return "Archived";
    return "Draft";
};

const formatVisibility = (visibility?: string | null) => {
    if (!visibility) return "private";
    return visibility.charAt(0).toUpperCase() + visibility.slice(1);
};

export default function PathView() {
    const {id} = useParams();
    const [path, setPath] = useState<PathDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPath = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await fetchPath(id);
                setPath(data);
                setError(null);
            } catch (err) {
                setError("Unable to load this path right now.");
                setPath(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadPath();
    }, [id]);

    const orderedModules = useMemo(() => {
        if (!path?.modules) return [];
        return [...path.modules].sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0));
    }, [path]);

    const publishedLabel = path?.status === "published"
        ? path.published_at ?? "Published (date not set)"
        : "Not published";

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin"/>
                <span>Loading path…</span>
            </div>
        );
    }

    if (error || !path) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-destructive">
                    {error ?? "Path not found."}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-primary/20  border shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {path.subject && (
                                <Badge variant="secondary" className="uppercase tracking-wide">
                                    {path.subject}
                                </Badge>
                            )}
                            {path.grade_band && (
                                <Badge variant="secondary" className="uppercase tracking-wide">
                                    {path.grade_band}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            <PageHeading lead={path.code} title={path.title}/>
                            <P className="max-w-2xl text-base text-muted-foreground">
                                {path.summary || "No summary provided yet."}
                            </P>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/60 px-3 py-1 font-medium text-primary">
                                {formatStatus(path.status)}
                            </span>
                            {path.owner && (
                                <>
                                    <span>Owner: <strong>{path.owner.name}</strong></span>
                                    <Separator className="h-4 w-px bg-white"/>
                                </>
                            )}
                            <span>Updated {path.updated_at ? new Date(path.updated_at).toLocaleDateString() : "recently"}</span>
                            <Separator className="h-4 w-px bg-white"/>
                            <span>Pacing: {path.pacing || "TBD"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <Button asChild size="lg">
                            <Link to={`/paths/${id}/edit`}>Edit path</Link>
                        </Button>
                        <Button variant="outline" size="lg">
                            Share overview
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex flex-1 flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning journey</CardTitle>
                            <CardDescription>Modules sequenced for this path.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {orderedModules.length === 0 ? (
                                <P className="text-sm text-muted-foreground">No modules added yet.</P>
                            ) : (
                                <ol className="space-y-6">
                                    {orderedModules.map((module: PathModuleSummary, index) => (
                                        <li key={module.id} className="relative pl-6">
                                            {index !== orderedModules.length - 1 && (
                                                <span className="absolute left-[9px] top-6 h-full w-px bg-border" aria-hidden/>
                                            )}
                                            <span className="absolute left-0 top-1 flex size-4 items-center justify-center rounded-full border border-primary bg-background text-xs font-semibold text-primary">
                                                {module.sequence_order ?? index + 1}
                                            </span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-primary">{module.title}</h3>
                                                        <P className="text-sm text-muted-foreground">Code: {module.code}</P>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Success criteria</CardTitle>
                            <CardDescription>Outcomes we monitor to know the path is landing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {path.success_metrics && path.success_metrics.length > 0 ? (
                                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                                    {path.success_metrics.map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-primary"/>
                                            <span className="text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <P className="text-sm text-muted-foreground">No success metrics captured yet.</P>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Objectives</CardTitle>
                            <CardDescription>Skills and goals this path advances.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {path.objectives && path.objectives.length > 0 ? (
                                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                                    {path.objectives.map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-primary"/>
                                            <span className="text-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <P className="text-sm text-muted-foreground">No objectives added yet.</P>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:w-80">
                    <div className="flex w-full flex-col gap-6 rounded-xl bg-gray-100 p-5">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-primary">Publishing</h3>
                                <P className="text-sm text-muted-foreground">
                                    Visibility and rollout details mirrored from the creation flow.
                                </P>
                            </div>
                            <Separator/>
                            <dl className="space-y-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Visibility</dt>
                                    <dd className="font-medium text-foreground">{formatVisibility(path.visibility)}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Path owner</dt>
                                    <dd className="font-medium text-foreground">{path.owner?.name ?? "Unassigned"}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Planned release date</dt>
                                    <dd className="font-medium text-foreground">{path.planned_release_date ?? "Not set"}</dd>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <dt className="text-muted-foreground">Published at</dt>
                                    <dd className="font-medium text-foreground">{publishedLabel}</dd>
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
