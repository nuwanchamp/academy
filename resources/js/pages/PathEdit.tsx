import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Loader2} from "lucide-react";
import {fetchModules} from "@/features/modules/services/moduleApi.ts";
import type {ModuleSummary} from "@/features/modules/types/module";
import {fetchPath, updatePath} from "@/features/paths/services/pathApi.ts";
import type {PathDetail} from "@/features/paths/types/path.ts";
import {useTaxonomies} from "@/features/settings/hooks/useTaxonomies.ts";

const subjectAreasFallback = [
    {value: "Mathematics", label: "Mathematics"},
    {value: "Science", label: "Science"},
    {value: "Literacy", label: "Literacy"},
    {value: "Humanities", label: "Humanities"},
    {value: "Wellness", label: "Wellness"},
];

const gradeBandsFallback = [
    {value: "Grades K – 2", label: "Grades K – 2"},
    {value: "Grades 3 – 5", label: "Grades 3 – 5"},
    {value: "Grades 6 – 8", label: "Grades 6 – 8"},
    {value: "Grades 9 – 12", label: "Grades 9 – 12"},
];

const pacingOptions = [
    {value: "4 weeks", label: "4 Weeks"},
    {value: "6 weeks", label: "6 Weeks"},
    {value: "8 weeks", label: "8 Weeks"},
    {value: "Self paced", label: "Self Paced"},
];

const outcomeSuggestions = [
    "Students can identify key vocabulary for the unit.",
    "Students complete module checkpoints with 80% mastery.",
    "Students collaborate on a project presentation.",
];

export default function PathEdit() {
    const {subjects, gradeBands} = useTaxonomies();
    const {id} = useParams();
    const navigate = useNavigate();

    const [path, setPath] = useState<PathDetail | null>(null);
    const [isLoadingPath, setIsLoadingPath] = useState(true);

    const [title, setTitle] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [objectivesInput, setObjectivesInput] = useState<string>("");
    const [successMetricsInput, setSuccessMetricsInput] = useState<string>("");
    const [pacing, setPacing] = useState<string>("");
    const [visibility, setVisibility] = useState<string>("private");
    const [releaseDate, setReleaseDate] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [gradeBand, setGradeBand] = useState<string>("");
    const [availableModules, setAvailableModules] = useState<ModuleSummary[]>([]);
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
    const [isLoadingModules, setIsLoadingModules] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPath = async () => {
            if (!id) return;
            setIsLoadingPath(true);
            try {
                const data = await fetchPath(id);
                setPath(data);
                setTitle(data.title);
                setSummary(data.summary ?? "");
                setObjectivesInput((data.objectives ?? []).join("\n"));
                setSuccessMetricsInput((data.success_metrics ?? []).join("\n"));
                setPacing(data.pacing ?? "");
                setVisibility(data.visibility ?? "private");
                setReleaseDate(data.planned_release_date ?? "");
                setSubject(data.subject ?? "");
                setGradeBand(data.grade_band ?? "");
                setSelectedModuleIds(data.modules?.map((module) => module.id) ?? []);
            } catch (err) {
                setError("Unable to load path.");
            } finally {
                setIsLoadingPath(false);
            }
        };

        loadPath();
    }, [id]);

    useEffect(() => {
        const loadModules = async () => {
            setIsLoadingModules(true);
            try {
                const response = await fetchModules({
                    subject: subject || undefined,
                    grade_band: gradeBand || undefined,
                    per_page: 100,
                });
                const existing = response.data ?? [];
                const selectedExtras = (path?.modules ?? [])
                    .filter((module) => !existing.find((item) => item.id === module.id))
                    .map((module) => ({
                        id: module.id,
                        title: module.title,
                        grade_band: module.grade_band ?? path?.grade_band ?? null,
                        lessons_count: module.lessons_count ?? 0,
                    } as ModuleSummary));

                setAvailableModules([...existing, ...selectedExtras]);
            } catch (error) {
                setAvailableModules([]);
            } finally {
                setIsLoadingModules(false);
            }
        };

        loadModules();
    }, [gradeBand, path?.grade_band, path?.modules, subject]);

    const toggleModuleSelection = (id: number) => {
        setSelectedModuleIds((prev) =>
            prev.includes(id) ? prev.filter((moduleId) => moduleId !== id) : [...prev, id]
        );
    };

    const modulesList = useMemo(() => {
        return availableModules.map((module) => ({
            id: module.id,
            title: module.title,
            grade: module.grade_band ?? "Grade range not set",
            lessons: module.lessons_count ?? 0,
        }));
    }, [availableModules]);

    const toLines = (value: string) => value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const handleSubmit = async (nextStatus: "draft" | "published") => {
        setIsSubmitting(true);
        setError(null);
        if (!title.trim()) {
            setError("Title is required.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                code: path?.code ?? "PATH",
                title,
                summary: summary || null,
                subject: subject || null,
                grade_band: gradeBand || null,
                status: nextStatus,
                visibility: visibility as "private" | "school" | "district",
                pacing: pacing || null,
                objectives: toLines(objectivesInput),
                success_metrics: toLines(successMetricsInput),
                planned_release_date: releaseDate || null,
                modules: selectedModuleIds.map((id, index) => ({
                    id,
                    sequence_order: index + 1,
                })),
            };

            const updated = await updatePath(id ?? "", payload);
            navigate(`/paths/${updated.id}`);
        } catch (err) {
            setError("Unable to save changes right now. Please review fields and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingPath) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin"/>
                <span>Loading path…</span>
            </div>
        );
    }

    if (!path) {
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
            <div className="text-primary">
                <PageHeading lead="Edit" title="Learning Path"/>
            </div>

            <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex flex-1 flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Path overview</CardTitle>
                            <CardDescription>Update the core details learners will see first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <p className="mb-4 text-sm text-destructive">
                                    {error}
                                </p>
                            )}
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="path-title">
                                        Path title *
                                    </FieldLabel>
                                    <Input
                                        id="path-title"
                                        placeholder="Example: Multiplication Mastery Roadmap"
                                        required
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                    />
                                </Field>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <Field>
                                        <FieldLabel htmlFor="subject-area">
                                            Subject area
                                        </FieldLabel>
                                        <Select value={subject} onValueChange={(value) => setSubject(value)}>
                                            <SelectTrigger id="subject-area">
                                                <SelectValue placeholder="Select subject"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(subjects.length ? subjects : subjectAreasFallback.map((s) => s.value)).map((subject) => (
                                                    <SelectItem key={subject} value={subject}>
                                                        {subject}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="grade-band">
                                            Target grades
                                        </FieldLabel>
                                        <Select value={gradeBand} onValueChange={(value) => setGradeBand(value)}>
                                            <SelectTrigger id="grade-band">
                                                <SelectValue placeholder="Select range"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(gradeBands.length ? gradeBands : gradeBandsFallback.map((band) => band.value)).map((band) => (
                                                    <SelectItem key={band} value={band}>
                                                        {band}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="pacing">
                                            Suggested pacing
                                        </FieldLabel>
                                        <Select value={pacing} onValueChange={(value) => setPacing(value)}>
                                            <SelectTrigger id="pacing">
                                                <SelectValue placeholder="Select option"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pacingOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="path-summary">
                                        Summary
                                    </FieldLabel>
                                    <Textarea
                                        id="path-summary"
                                        placeholder="Describe the learning path in 2-3 sentences."
                                        rows={3}
                                        value={summary}
                                        onChange={(event) => setSummary(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="path-objectives">
                                        Learning objectives
                                    </FieldLabel>
                                    <Textarea
                                        id="path-objectives"
                                        placeholder="Highlight the skills or standards this path covers."
                                        rows={4}
                                        value={objectivesInput}
                                        onChange={(event) => setObjectivesInput(event.target.value)}
                                    />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Learning sequence</CardTitle>
                            <CardDescription>Select the modules that scaffold the learning experience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldSet>
                                <FieldLegend>Available modules</FieldLegend>
                                <FieldDescription>
                                    Check the modules you want to include. You can reorder them after saving.
                                </FieldDescription>
                                {isLoadingModules ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="size-4 animate-spin"/>
                                        <span>Loading modules…</span>
                                    </div>
                                ) : modulesList.length === 0 ? (
                                    <FieldDescription>No modules match the selected subject/grade yet.</FieldDescription>
                                ) : (
                                    <FieldGroup data-slot="checkbox-group">
                                        {modulesList.map((module) => {
                                            const isSelected = selectedModuleIds.includes(module.id);
                                            return (
                                                <Field key={module.id} orientation="horizontal" className="items-start">
                                                    <Checkbox
                                                        id={`module-${module.id}`}
                                                        aria-describedby={`module-${module.id}-description`}
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleModuleSelection(module.id)}
                                                    />
                                                    <FieldContent>
                                                        <FieldLabel htmlFor={`module-${module.id}`} className="text-base font-medium">
                                                            {module.title}
                                                        </FieldLabel>
                                                        <FieldDescription id={`module-${module.id}-description`}>
                                                            {module.grade} • {module.lessons} lessons
                                                        </FieldDescription>
                                                    </FieldContent>
                                                </Field>
                                            );
                                        })}
                                    </FieldGroup>
                                )}
                            </FieldSet>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Success criteria</CardTitle>
                            <CardDescription>Capture the outcomes used to measure mastery.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="path-outcomes">
                                        Success metrics
                                    </FieldLabel>
                                    <Textarea
                                        id="path-outcomes"
                                        placeholder="List how you will monitor learner progress."
                                        rows={4}
                                        value={successMetricsInput}
                                        onChange={(event) => setSuccessMetricsInput(event.target.value)}
                                    />
                                    <FieldDescription>
                                        Need inspiration? Try capturing clear checkpoints like:
                                    </FieldDescription>
                                    <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                                        {outcomeSuggestions.map((suggestion) => (
                                            <li key={suggestion}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </Field>
                            </FieldGroup>
                        </CardContent>
                        <CardFooter className="justify-end gap-3">
                            <Button
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => handleSubmit("draft")}
                            >
                                {isSubmitting ? "Saving…" : "Save draft"}
                            </Button>
                            <Button disabled={isSubmitting} onClick={() => handleSubmit("published")}>
                                {isSubmitting ? "Updating…" : "Update path"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="w-1/3">
                    <div className="flex w-full flex-col gap-8 rounded-xl bg-gray-100 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                                <CardDescription>Control who can view the path and when it goes live.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="visibility">
                                            Visibility
                                        </FieldLabel>
                                        <Select value={visibility} onValueChange={(value) => setVisibility(value)}>
                                            <SelectTrigger id="visibility">
                                                <SelectValue placeholder="Select visibility"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private">Private (draft)</SelectItem>
                                                <SelectItem value="school">School team</SelectItem>
                                                <SelectItem value="district">District-wide</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="release-date">
                                            Planned release date
                                        </FieldLabel>
                                        <Input
                                            id="release-date"
                                            type="date"
                                            value={releaseDate}
                                            onChange={(event) => setReleaseDate(event.target.value)}
                                        />
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
