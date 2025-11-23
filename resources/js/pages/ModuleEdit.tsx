import {useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent} from "react";
import {useParams} from "react-router-dom";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {FileText, UploadCloud, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import RichTextEditor from "@/components/RichTextEditor.tsx";
import {useModule} from "@/features/modules/hooks/useModule.ts";
import {updateModule} from "@/features/modules/services/moduleApi.ts";
import {useTaxonomies} from "@/features/settings/hooks/useTaxonomies.ts";

interface LessonMediaAsset {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
}

interface LessonFormData {
    id: string;
    title: string;
    order: string;
    summary: string;
    objectives: string;
    outcomes: string;
    body: string;
    instructions: string;
    media: LessonMediaAsset[];
}

const subjectOptionsFallback = ["Wellness", "Literacy", "Science", "Mathematics", "Arts", "Humanities"];
const gradeBandOptionsFallback = ["Grades K – 2", "Grades 3 – 5", "Grades 4 – 6", "Grades 5 – 8", "Grades 6 – 8", "Grades 7 – 8", "Grades 8 – 10"];
const statusOptions = ["draft", "published", "archived"] as const;

const ModuleEdit = () => {
    const {id} = useParams<{id: string}>();
    const {subjects, gradeBands} = useTaxonomies();
    const {module, isLoading, error, reload} = useModule(id);
    const [moduleFields, setModuleFields] = useState({
        code: "",
        title: "",
        summary: "",
        objectives: "",
        prerequisites: "",
        subject: "",
        gradeBand: "",
        difficulty: "",
        duration: "",
        learningType: "",
        tags: "",
        authorName: "",
        authorBio: "",
        authorLinks: "",
        version: "",
        status: "",
        accessControl: "",
        progressTracking: "",
        completionCriteria: "",
        feedbackStrategy: "",
        publishedAt: "",
        archivedAt: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeLesson, setActiveLesson] = useState<string>("lesson-1");
    const [lessons, setLessons] = useState<Array<LessonFormData>>([
        {
            id: "lesson-1",
            title: "",
            order: "1",
            summary: "",
            objectives: "",
            outcomes: "",
            body: "",
            instructions: "",
            media: [],
        },
    ]);
    const lessonInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const objectUrlRegistry = useRef<Map<string, string>>(new Map());
    const draggingLessonRef = useRef<string | null>(null);
    const [draggingLessonId, setDraggingLessonId] = useState<string | null>(null);

    const updateLesson = useCallback(
        (lessonId: string, updater: (lesson: LessonFormData) => LessonFormData) => {
            setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? updater(lesson) : lesson)));
        },
        [],
    );

    const handleLessonFieldChange = useCallback(
        (lessonId: string, field: keyof LessonFormData, value: string) => {
            updateLesson(lessonId, (lesson) => ({
                ...lesson,
                [field]: value,
            }));
        },
        [updateLesson],
    );

    const formatFileSize = useCallback((size: number) => {
        if (!Number.isFinite(size) || size <= 0) {
            return "0 B";
        }

        const units = ["B", "KB", "MB", "GB", "TB"];
        let unitIndex = 0;
        let value = size;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }

        const precision = value < 10 && unitIndex > 0 ? 1 : 0;
        return `${value.toFixed(precision)} ${units[unitIndex]}`;
    }, []);

    const handleMediaFiles = useCallback((lessonId: string, files: FileList | null) => {
        if (!files?.length) {
            return;
        }

        const mapped = Array.from(files).map((file) => {
            const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const url = URL.createObjectURL(file);
            objectUrlRegistry.current.set(id, url);

            return {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                url,
            };
        });

        updateLesson(lessonId, (lesson) => ({
            ...lesson,
            media: [...lesson.media, ...mapped],
        }));
    }, [updateLesson]);

    const handleMediaInputChange = useCallback(
        (lessonId: string, event: ChangeEvent<HTMLInputElement>) => {
            handleMediaFiles(lessonId, event.target.files);
            event.target.value = "";
        },
        [handleMediaFiles],
    );

    const handleMediaDrop = useCallback(
        (lessonId: string, event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDraggingLessonId(null);
            handleMediaFiles(lessonId, event.dataTransfer.files);
        },
        [handleMediaFiles],
    );

    const handleLessonDragOver = useCallback((lessonId: string, event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        draggingLessonRef.current = lessonId;
        setDraggingLessonId(lessonId);
    }, []);

    const handleLessonDragLeave = useCallback((lessonId: string, event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && event.currentTarget.contains(nextTarget)) {
            return;
        }

        if (draggingLessonRef.current === lessonId) {
            draggingLessonRef.current = null;
            setDraggingLessonId(null);
        }
    }, []);

    const removeMediaAsset = useCallback((lessonId: string, assetId: string) => {
        const objectUrl = objectUrlRegistry.current.get(assetId);
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrlRegistry.current.delete(assetId);
        }

        updateLesson(lessonId, (lesson) => ({
            ...lesson,
            media: lesson.media.filter((asset) => asset.id !== assetId),
        }));
    }, [updateLesson]);

    const addNewLesson = useCallback(() => {
        const nextIndex = lessons.length + 1;
        const newLessonId = `lesson-${nextIndex}`;

        setLessons((prev) => ([
            ...prev,
            {
                id: newLessonId,
                title: "",
                order: String(nextIndex),
                summary: "",
                objectives: "",
                outcomes: "",
                body: "",
                instructions: "",
                media: [],
            },
        ]));

        setActiveLesson(newLessonId);
    }, [lessons.length]);

    useEffect(() => {
        return () => {
            objectUrlRegistry.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrlRegistry.current.clear();
        };
    }, []);

    const splitLines = (value: string): string[] =>
        value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

    const parseTags = (value: string): string[] =>
        value
            .split(/[,;\n]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

    const parseAuthorLinks = (value: string): Array<{label: string; href: string}> =>
        value
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const [label, href] = line.split("|").map((part) => part.trim());
                return {label: label || "Link", href: href || line};
            });

    const resetFeedback = () => {
        setFeedback(null);
        setErrors({});
    };

    const handleModuleField = (field: keyof typeof moduleFields) => (value: string) => {
        setModuleFields((prev) => ({...prev, [field]: value}));
    };

    useEffect(() => {
        if (!module) {
            return;
        }

        const firstAuthor = module.authors?.[0] ?? null;
        const mappedLessons: LessonFormData[] = (module.lessons ?? []).map((lesson, idx) => ({
            id: `lesson-${idx + 1}`,
            title: lesson.title ?? "",
            order: String(lesson.sequence_order ?? idx + 1),
            summary: lesson.summary ?? "",
            objectives: (lesson.objectives ?? []).join("\n"),
            outcomes: (lesson.outcomes ?? []).join("\n"),
            body: lesson.body ?? "",
            instructions: lesson.instructions ?? "",
            media: [],
        }));

        setLessons(mappedLessons.length > 0 ? mappedLessons : lessons);
        setActiveLesson(mappedLessons[0]?.id ?? "lesson-1");

        setModuleFields({
            code: module.code ?? "",
            title: module.title ?? "",
            summary: module.summary ?? "",
            objectives: (module.objectives ?? []).join("\n"),
            prerequisites: (module.prerequisites ?? []).join("\n"),
            subject: module.subject ?? "",
            gradeBand: module.grade_band ?? "",
            difficulty: module.difficulty ?? "",
            duration: module.estimated_duration ?? "",
            learningType: module.learning_type ?? "",
            tags: (module.tags ?? []).join(", "),
            authorName: firstAuthor?.name ?? "",
            authorBio: firstAuthor?.bio ?? "",
            authorLinks: (firstAuthor?.contact_links ?? [])
                .map((link) => `${link.label ?? "Link"} | ${link.href}`)
                .join("\n"),
            version: module.version_label ?? "",
            status: (module.status ?? "draft").toLowerCase(),
            accessControl: module.access_control ?? "",
            progressTracking: module.progress_tracking ?? "",
            completionCriteria: module.completion_criteria ?? "",
            feedbackStrategy: module.feedback_strategy ?? "",
            publishedAt: module.published_at ?? "",
            archivedAt: module.archived_at ?? "",
        });
    }, [module]);

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        resetFeedback();

        if (!moduleFields.code.trim() || !moduleFields.title.trim() || !module?.id) {
            setErrors({
                code: moduleFields.code ? "" : "Module code is required.",
                title: moduleFields.title ? "" : "Module title is required.",
            });
            setFeedback("Please fill in the required fields.");
            return;
        }

        setIsSaving(true);

        const payload: Record<string, unknown> = {
            code: moduleFields.code.trim(),
            title: moduleFields.title.trim(),
            summary: moduleFields.summary.trim() || null,
            subject: moduleFields.subject || null,
            grade_band: moduleFields.gradeBand || null,
            status: moduleFields.status || "draft",
            version_label: moduleFields.version.trim() || null,
            difficulty: moduleFields.difficulty || null,
            estimated_duration: moduleFields.duration.trim() || null,
            learning_type: moduleFields.learningType || null,
            objectives: splitLines(moduleFields.objectives),
            prerequisites: splitLines(moduleFields.prerequisites),
            progress_tracking: moduleFields.progressTracking.trim() || null,
            completion_criteria: moduleFields.completionCriteria.trim() || null,
            feedback_strategy: moduleFields.feedbackStrategy.trim() || null,
            access_control: moduleFields.accessControl.trim() || null,
            published_at: moduleFields.publishedAt || null,
            archived_at: moduleFields.archivedAt || null,
            tags: parseTags(moduleFields.tags),
        };

        if (moduleFields.authorName.trim()) {
            payload.authors = [
                {
                    name: moduleFields.authorName.trim(),
                    role: "Author",
                    bio: moduleFields.authorBio.trim() || null,
                    contact_links: parseAuthorLinks(moduleFields.authorLinks),
                },
            ];
        }

        payload.lessons = lessons
            .filter((lesson) => lesson.title.trim().length > 0)
            .map((lesson, index) => ({
                title: lesson.title.trim(),
                sequence_order: Number(lesson.order) || index + 1,
                summary: lesson.summary.trim() || null,
                objectives: splitLines(lesson.objectives),
                outcomes: splitLines(lesson.outcomes),
                body: lesson.body || null,
                instructions: lesson.instructions || null,
                media_uploads: lesson.media.map((asset) => ({
                    file_name: asset.name,
                    mime_type: asset.type,
                    file_size_bytes: asset.size,
                    storage_path: null,
                    meta: {preview_url: asset.url},
                })),
            }));

        try {
            await updateModule(module.id, payload);
            setFeedback("Module updated successfully.");
        } catch (err) {
            const isValidationError = err && typeof err === "object" && "response" in err && (err as any).response?.status === 422;
            if (isValidationError) {
                const validationErrors = (err as any).response?.data?.errors ?? {};
                const mapped: Record<string, string> = {};
                Object.entries(validationErrors).forEach(([key, messages]) => {
                    mapped[key] = Array.isArray(messages) ? messages[0] : "Invalid value";
                });
                setErrors(mapped);
                setFeedback("Please correct the highlighted fields.");
            } else {
                setFeedback("Unable to update the module. Please try again.");
            }
        } finally {
            setIsSaving(false);
        }
    };

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
        <>
            <div className="text-primary">
                <PageHeading lead="Edit" title="Module" />
            </div>
            {feedback && (
                <div className="mt-4 rounded-md border bg-muted/40 px-4 py-3 text-sm text-foreground">
                    {feedback}
                </div>
            )}
            <div className="w-full flex gap-4 flex-row justify-between items-start mt-6">
                <div className="w-2/3">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Blueprint</CardTitle>
                                <CardDescription>
                                    Update the essentials for this module.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="module-code">Module code or ID</FieldLabel>
                                        <Input
                                            id="module-code"
                                            placeholder="MOD-EXPLR-001"
                                            value={moduleFields.code}
                                            onChange={(event) => handleModuleField("code")(event.target.value)}
                                            required
                                        />
                                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-title">Module title *</FieldLabel>
                                        <Input
                                            id="module-title"
                                            placeholder="Sensory Exploration Basics"
                                            value={moduleFields.title}
                                            onChange={(event) => handleModuleField("title")(event.target.value)}
                                            required
                                        />
                                        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-summary">Description / summary</FieldLabel>
                                        <Textarea
                                            id="module-summary"
                                            placeholder="Provide a concise overview of the focus, themes, and impact for learners."
                                            rows={4}
                                            value={moduleFields.summary}
                                            onChange={(event) => handleModuleField("summary")(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-objectives">Learning objectives / outcomes</FieldLabel>
                                        <Textarea
                                            id="module-objectives"
                                            placeholder="List the knowledge, skills, or behaviours learners should demonstrate after completion."
                                            rows={4}
                                            value={moduleFields.objectives}
                                            onChange={(event) => handleModuleField("objectives")(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-prerequisites">Prerequisites</FieldLabel>
                                        <Textarea
                                            id="module-prerequisites"
                                            placeholder="Note the prior modules, competencies, or context learners need before starting."
                                            rows={3}
                                            value={moduleFields.prerequisites}
                                            onChange={(event) => handleModuleField("prerequisites")(event.target.value)}
                                        />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="module-subject">Subject</FieldLabel>
                                            <Select
                                                value={moduleFields.subject || undefined}
                                                onValueChange={(value) => handleModuleField("subject")(value)}
                                            >
                                                <SelectTrigger id="module-subject">
                                                    <SelectValue placeholder="Select subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {(subjects.length ? subjects : subjectOptionsFallback).map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="module-grade">Grade band</FieldLabel>
                                            <Select
                                                value={moduleFields.gradeBand || undefined}
                                                onValueChange={(value) => handleModuleField("gradeBand")(value)}
                                            >
                                                <SelectTrigger id="module-grade">
                                                    <SelectValue placeholder="Select grade band" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                {(gradeBands.length ? gradeBands : gradeBandOptionsFallback).map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>
                                    <Field>
                                        <FieldLabel htmlFor="module-progress">Progress tracking</FieldLabel>
                                        <Textarea
                                            id="module-progress"
                                            placeholder="Describe how progress is captured for this module."
                                            rows={3}
                                            value={moduleFields.progressTracking}
                                            onChange={(event) => handleModuleField("progressTracking")(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-completion">Completion criteria</FieldLabel>
                                        <Textarea
                                            id="module-completion"
                                            placeholder="Define what completion looks like."
                                            rows={3}
                                            value={moduleFields.completionCriteria}
                                            onChange={(event) => handleModuleField("completionCriteria")(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-feedback">Feedback strategy</FieldLabel>
                                        <Textarea
                                            id="module-feedback"
                                            placeholder="Document how feedback is gathered and shared."
                                            rows={3}
                                            value={moduleFields.feedbackStrategy}
                                            onChange={(event) => handleModuleField("feedbackStrategy")(event.target.value)}
                                        />
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col gap-4 mt-6 text-primary">
                            <Tabs
                                value={activeLesson}
                                onValueChange={setActiveLesson}
                                className="w-full"
                            >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <TabsList>
                                        {lessons.map((lesson, index) => (
                                            <TabsTrigger key={lesson.id} value={lesson.id}>
                                                Lesson {String(index + 1).padStart(2, "0")}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={addNewLesson}
                                    >
                                        + New lesson
                                    </Button>
                                </div>
                                {lessons.map((lesson, index) => {
                                    const isActive = activeLesson === lesson.id;
                                    const isDragging = draggingLessonId === lesson.id;

                                    return (
                                        <TabsContent key={lesson.id} value={lesson.id} className="mt-4">
                                            <Card className={cn(isActive ? "" : "")}>
                                                <CardContent className="flex flex-col gap-8">
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Core Identity
                                                        </span>
                                                        <FieldGroup>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Field>
                                                                    <FieldLabel htmlFor={`lesson-${index}-title`}>Title</FieldLabel>
                                                                    <Input
                                                                        id={`lesson-${index}-title`}
                                                                        placeholder="Exploring Sensory Inputs"
                                                                        value={lesson.title}
                                                                        onChange={(event) =>
                                                                            handleLessonFieldChange(lesson.id, "title", event.target.value)
                                                                        }
                                                                    />
                                                                </Field>
                                                                <Field>
                                                                    <FieldLabel htmlFor={`lesson-${index}-order`}>Order / sequence number</FieldLabel>
                                                                    <Input
                                                                        id={`lesson-${index}-order`}
                                                                        type="number"
                                                                        value={lesson.order}
                                                                        onChange={(event) =>
                                                                            handleLessonFieldChange(lesson.id, "order", event.target.value)
                                                                        }
                                                                        min="1"
                                                                        placeholder="1"
                                                                    />
                                                                </Field>
                                                            </div>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-summary`}>Description / summary</FieldLabel>
                                                                <Textarea
                                                                    id={`lesson-${index}-summary`}
                                                                    placeholder="Outline the focus of this lesson and the learner experience."
                                                                    rows={3}
                                                                    value={lesson.summary}
                                                                    onChange={(event) =>
                                                                        handleLessonFieldChange(lesson.id, "summary", event.target.value)
                                                                    }
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-objectives`}>Objectives / learning outcomes</FieldLabel>
                                                                <Textarea
                                                                    id={`lesson-${index}-objectives`}
                                                                    placeholder="List specific skills or knowledge students should demonstrate after this lesson."
                                                                    rows={3}
                                                                    value={lesson.objectives}
                                                                    onChange={(event) =>
                                                                        handleLessonFieldChange(lesson.id, "objectives", event.target.value)
                                                                    }
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-outcomes`}>Outcomes / evidence</FieldLabel>
                                                                <Textarea
                                                                    id={`lesson-${index}-outcomes`}
                                                                    placeholder="Capture observable outcomes or evidence collected in this lesson."
                                                                    rows={3}
                                                                    value={lesson.outcomes}
                                                                    onChange={(event) =>
                                                                        handleLessonFieldChange(lesson.id, "outcomes", event.target.value)
                                                                    }
                                                                />
                                                            </Field>
                                                        </FieldGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Content
                                                        </span>
                                                        <FieldGroup>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-body`}>Body / content blocks</FieldLabel>
                                                                <RichTextEditor
                                                                    id={`lesson-${index}-body`}
                                                                    value={lesson.body}
                                                                    onChange={(value) => handleLessonFieldChange(lesson.id, "body", value)}
                                                                    placeholder="Add the core delivery content, including text, slide notes, scripts, or embed instructions."
                                                                    minHeight={280}
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-instructions`}>Facilitation instructions</FieldLabel>
                                                                <RichTextEditor
                                                                    id={`lesson-${index}-instructions`}
                                                                    value={lesson.instructions}
                                                                    onChange={(value) => handleLessonFieldChange(lesson.id, "instructions", value)}
                                                                    placeholder="Capture reminders for facilitators: tone-setting, materials prep, or cross-lesson scaffolds."
                                                                    minHeight={220}
                                                                />
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel htmlFor={`lesson-${index}-media`}>Media assets</FieldLabel>
                                                                <div
                                                                    className={cn(
                                                                        "border border-dashed border-input rounded-lg p-6 text-center transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer",
                                                                        isDragging ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/80 hover:bg-muted/50 text-muted-foreground",
                                                                    )}
                                                                    onDragEnter={(event) => handleLessonDragOver(lesson.id, event)}
                                                                    onDragOver={(event) => handleLessonDragOver(lesson.id, event)}
                                                                    onDragLeave={(event) => handleLessonDragLeave(lesson.id, event)}
                                                                    onDrop={(event) => handleMediaDrop(lesson.id, event)}
                                                                    onClick={() => lessonInputRefs.current.get(lesson.id)?.click()}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(event) => {
                                                                        if (event.key === "Enter" || event.key === " ") {
                                                                            event.preventDefault();
                                                                            lessonInputRefs.current.get(lesson.id)?.click();
                                                                        }
                                                                    }}
                                                                    aria-label="Upload lesson media"
                                                                >
                                                                    <UploadCloud
                                                                        className={cn(
                                                                            "size-10 text-muted-foreground transition-colors",
                                                                            isDragging && "text-primary",
                                                                        )}
                                                                    />
                                                                    <div className="text-sm font-medium text-foreground">
                                                                        Drag &amp; drop files here
                                                                        <span className="text-primary block">
                                                                            or browse from your computer
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground max-w-xs">
                                                                        Upload images, audio, video, or documents (multiple files supported)
                                                                    </p>
                                                                    <input
                                                                        ref={(element) => {
                                                                            if (element) {
                                                                                lessonInputRefs.current.set(lesson.id, element);
                                                                            } else {
                                                                                lessonInputRefs.current.delete(lesson.id);
                                                                            }
                                                                        }}
                                                                        id={`lesson-${index}-media`}
                                                                        type="file"
                                                                        className="hidden"
                                                                        multiple
                                                                        onChange={(event) => handleMediaInputChange(lesson.id, event)}
                                                                    />
                                                                </div>
                                                                {lesson.media.length > 0 && (
                                                                    <div className="mt-4 flex flex-col gap-2">
                                                                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            Attachments
                                                                        </span>
                                                                        <ul className="flex flex-col gap-2">
                                                                            {lesson.media.map((asset) => (
                                                                                <li
                                                                                    key={asset.id}
                                                                                    className="bg-background border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                                                                                >
                                                                                    <div className="flex items-center gap-3 text-left">
                                                                                        <div className="size-12 overflow-hidden rounded-md border border-border flex items-center justify-center bg-muted">
                                                                                            {asset.type.startsWith("image/") ? (
                                                                                                <img
                                                                                                    src={asset.url}
                                                                                                    alt={asset.name}
                                                                                                    className="size-full object-cover"
                                                                                                />
                                                                                            ) : (
                                                                                                <FileText className="size-5 text-primary"/>
                                                                                            )}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-foreground break-all">
                                                                                                {asset.name}
                                                                                            </p>
                                                                                            <p className="text-xs text-muted-foreground">
                                                                                                {formatFileSize(asset.size)}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            type="button"
                                                                                            asChild
                                                                                        >
                                                                                            <a
                                                                                                href={asset.url}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                            >
                                                                                                Preview
                                                                                            </a>
                                                                                        </Button>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            type="button"
                                                                                            aria-label={`Remove ${asset.name}`}
                                                                                            onClick={(event) => {
                                                                                                event.stopPropagation();
                                                                                                removeMediaAsset(lesson.id, asset.id);
                                                                                            }}
                                                                                        >
                                                                                            <X className="size-4"/>
                                                                                        </Button>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </Field>
                                                        </FieldGroup>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </div>
                        <div className="flex justify-end">
                            <Button size="lg" type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save module"}
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="w-1/3 bg-gray-100 flex flex-col gap-4 p-4 rounded-xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedagogical Meta-data</CardTitle>
                            <CardDescription>
                                Provide guidance for scheduling, curation, and discovery.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="module-difficulty">Difficulty level</FieldLabel>
                                    <Select
                                        value={moduleFields.difficulty}
                                        onValueChange={(value) => handleModuleField("difficulty")(value)}
                                    >
                                        <SelectTrigger id="module-difficulty">
                                            <SelectValue placeholder="Select level"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-duration">Estimated duration</FieldLabel>
                                    <Input
                                        id="module-duration"
                                        placeholder="e.g. 6 hours, 4 sessions"
                                        value={moduleFields.duration}
                                        onChange={(event) => handleModuleField("duration")(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-learning-type">Learning type</FieldLabel>
                                    <Select
                                        value={moduleFields.learningType}
                                        onValueChange={(value) => handleModuleField("learningType")(value)}
                                    >
                                        <SelectTrigger id="module-learning-type">
                                            <SelectValue placeholder="Select format"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Theoretical">Theoretical</SelectItem>
                                            <SelectItem value="Hands-on">Hands-on</SelectItem>
                                            <SelectItem value="Project-based">Project-based</SelectItem>
                                            <SelectItem value="Blended">Blended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-tags">Tags / topics / skills</FieldLabel>
                                    <Input
                                        id="module-tags"
                                        placeholder="Communication, sensory integration, self-regulation"
                                        value={moduleFields.tags}
                                        onChange={(event) => handleModuleField("tags")(event.target.value)}
                                    />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Administrative</CardTitle>
                            <CardDescription>
                                Support ownership, versioning, and visibility controls.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="module-author-name">Author / instructor name</FieldLabel>
                                    <Input
                                        id="module-author-name"
                                        placeholder="Alex Rivera"
                                        value={moduleFields.authorName}
                                        onChange={(event) => handleModuleField("authorName")(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-author-bio">Author bio</FieldLabel>
                                    <Textarea
                                        id="module-author-bio"
                                        placeholder="Share a brief background and relevant expertise."
                                        rows={3}
                                        value={moduleFields.authorBio}
                                        onChange={(event) => handleModuleField("authorBio")(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-author-links">Author contact links</FieldLabel>
                                    <Textarea
                                        id="module-author-links"
                                        placeholder="Add email, website, or profile links for follow-up. One per line as Label | link"
                                        rows={3}
                                        value={moduleFields.authorLinks}
                                        onChange={(event) => handleModuleField("authorLinks")(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-version">Versioning notes</FieldLabel>
                                    <Input
                                        id="module-version"
                                        placeholder="v1.0 – Initial draft"
                                        value={moduleFields.version}
                                        onChange={(event) => handleModuleField("version")(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-status">Publication status</FieldLabel>
                                    <Select
                                        value={moduleFields.status}
                                        onValueChange={(value) => handleModuleField("status")(value)}
                                    >
                                        <SelectTrigger id="module-status">
                                            <SelectValue placeholder="Select status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-access">Access control</FieldLabel>
                                    <Textarea
                                        id="module-access"
                                        placeholder="Indicate who can view or edit (e.g. Grade 3 teachers, admin only)."
                                        rows={3}
                                        value={moduleFields.accessControl}
                                        onChange={(event) => handleModuleField("accessControl")(event.target.value)}
                                    />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="module-published">Published at</FieldLabel>
                                        <Input
                                            id="module-published"
                                            type="date"
                                            value={moduleFields.publishedAt}
                                            onChange={(event) => handleModuleField("publishedAt")(event.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-archived">Archived at</FieldLabel>
                                        <Input
                                            id="module-archived"
                                            type="date"
                                            value={moduleFields.archivedAt}
                                            onChange={(event) => handleModuleField("archivedAt")(event.target.value)}
                                        />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default ModuleEdit;
