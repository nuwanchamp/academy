import {useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent} from "react";
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
    body: string;
    instructions: string;
    media: LessonMediaAsset[];
}

export default function ModuleCreate() {
    const [activeLesson, setActiveLesson] = useState<string>("lesson-1");
    const [lessons, setLessons] = useState<Array<LessonFormData>>([
        {
            id: "lesson-1",
            title: "",
            order: "1",
            summary: "",
            objectives: "",
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

    return (
        <>
            <div className="text-primary">
                <PageHeading lead="New" title="Module"/>
            </div>
            <div className="w-full flex gap-4 flex-row justify-between items-start mt-6">
                <div className="w-2/3">
                    <form className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Blueprint</CardTitle>
                                <CardDescription>
                                    Capture the essentials that teachers and learners rely on when delivering this learning experience.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="module-code">Module code or ID</FieldLabel>
                                        <Input id="module-code" placeholder="MOD-EXPLR-001"/>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-title">Module title *</FieldLabel>
                                        <Input id="module-title" placeholder="Sensory Exploration Basics"/>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-summary">Description / summary</FieldLabel>
                                        <Textarea
                                            id="module-summary"
                                            placeholder="Provide a concise overview of the focus, themes, and impact for learners."
                                            rows={4}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-objectives">Learning objectives / outcomes</FieldLabel>
                                        <Textarea
                                            id="module-objectives"
                                            placeholder="List the knowledge, skills, or behaviours learners should demonstrate after completion."
                                            rows={4}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="module-prerequisites">Prerequisites</FieldLabel>
                                        <Textarea
                                            id="module-prerequisites"
                                            placeholder="Note the prior modules, competencies, or context learners need before starting."
                                            rows={3}
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
                            <Button size="lg">
                                Save module
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
                                    <Select defaultValue="">
                                        <SelectTrigger id="module-difficulty">
                                            <SelectValue placeholder="Select level"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-duration">Estimated duration</FieldLabel>
                                    <Input id="module-duration" placeholder="e.g. 6 hours, 4 sessions"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-learning-type">Learning type</FieldLabel>
                                    <Select defaultValue="">
                                        <SelectTrigger id="module-learning-type">
                                            <SelectValue placeholder="Select format"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="theoretical">Theoretical</SelectItem>
                                            <SelectItem value="hands-on">Hands-on</SelectItem>
                                            <SelectItem value="project-based">Project-based</SelectItem>
                                            <SelectItem value="blended">Blended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-tags">Tags / topics / skills</FieldLabel>
                                    <Input
                                        id="module-tags"
                                        placeholder="Communication, sensory integration, self-regulation"
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
                                    <Input id="module-author-name" placeholder="Alex Rivera"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-author-bio">Author bio</FieldLabel>
                                    <Textarea
                                        id="module-author-bio"
                                        placeholder="Share a brief background and relevant expertise."
                                        rows={3}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-author-links">Author contact links</FieldLabel>
                                    <Textarea
                                        id="module-author-links"
                                        placeholder="Add email, website, or profile links for follow-up."
                                        rows={3}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-version">Versioning notes</FieldLabel>
                                    <Input id="module-version" placeholder="v1.0 – Initial draft"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-status">Publication status</FieldLabel>
                                    <Select defaultValue="">
                                        <SelectTrigger id="module-status">
                                            <SelectValue placeholder="Select status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="module-access">Access control</FieldLabel>
                                    <Textarea
                                        id="module-access"
                                        placeholder="Indicate who can view or edit (e.g. Grade 3 teachers, admin only)."
                                        rows={3}
                                    />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing Checklist</CardTitle>
                            <CardDescription>
                                Ensure the module overview feels ready before sharing with the wider team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                            <p>- Confirm objectives align with the student&apos;s learning path.</p>
                            <p>- Attach supporting media in the materials section.</p>
                            <p>- Double-check assessment items and completion rules.</p>
                            <p>- Set the publication status once everything feels final.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Need Inspiration?</CardTitle>
                            <CardDescription>
                                Link to past modules or templates that can help you move faster.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <p>- Sensory Stories Starter Kit</p>
                            <p>- Communication Circles Weekly Plan</p>
                            <p>- Collaborative Projects Playbook</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
