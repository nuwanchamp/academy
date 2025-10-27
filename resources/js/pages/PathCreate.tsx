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

const subjectAreas = [
    {value: "mathematics", label: "Mathematics"},
    {value: "science", label: "Science"},
    {value: "language-arts", label: "Language Arts"},
    {value: "technology", label: "Technology"},
];

const gradeBands = [
    {value: "k-2", label: "K – 2"},
    {value: "3-5", label: "3 – 5"},
    {value: "6-8", label: "6 – 8"},
    {value: "9-12", label: "9 – 12"},
];

const pacingOptions = [
    {value: "4-weeks", label: "4 Weeks"},
    {value: "6-weeks", label: "6 Weeks"},
    {value: "8-weeks", label: "8 Weeks"},
    {value: "self-paced", label: "Self Paced"},
];

const moduleCatalog = [
    {
        id: "fractions-foundations",
        title: "Fractions Foundations",
        grade: "Grade 4",
        lessons: 6,
    },
    {
        id: "geometry-explorers",
        title: "Geometry Explorers",
        grade: "Grade 5",
        lessons: 5,
    },
    {
        id: "math-in-motion",
        title: "Math in Motion",
        grade: "Grade 3",
        lessons: 4,
    },
];

const outcomeSuggestions = [
    "Students can identify key vocabulary for the unit.",
    "Students complete module checkpoints with 80% mastery.",
    "Students collaborate on a project presentation.",
];

export default function PathCreate() {
    return (
        <div className="space-y-8">
            <div className="text-primary">
                <PageHeading lead="Create" title="Learning Path"/>
            </div>

            <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex flex-1 flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Path overview</CardTitle>
                            <CardDescription>Outline the core details learners will see first.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="path-title">
                                        Path title *
                                    </FieldLabel>
                                    <Input
                                        id="path-title"
                                        placeholder="Example: Multiplication Mastery Roadmap"
                                        required
                                    />
                                </Field>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <Field>
                                        <FieldLabel htmlFor="subject-area">
                                            Subject area
                                        </FieldLabel>
                                        <Select defaultValue="">
                                            <SelectTrigger id="subject-area">
                                                <SelectValue placeholder="Select subject"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjectAreas.map((subject) => (
                                                    <SelectItem key={subject.value} value={subject.value}>
                                                        {subject.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="grade-band">
                                            Target grades
                                        </FieldLabel>
                                        <Select defaultValue="">
                                            <SelectTrigger id="grade-band">
                                                <SelectValue placeholder="Select range"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradeBands.map((band) => (
                                                    <SelectItem key={band.value} value={band.value}>
                                                        {band.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="pacing">
                                            Suggested pacing
                                        </FieldLabel>
                                        <Select defaultValue="">
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
                                <FieldGroup data-slot="checkbox-group">
                                    {moduleCatalog.map((module) => (
                                        <Field key={module.id} orientation="horizontal" className="items-start">
                                            <Checkbox id={module.id} aria-describedby={`${module.id}-description`}/>
                                            <FieldContent>
                                                <FieldLabel htmlFor={module.id} className="text-base font-medium">
                                                    {module.title}
                                                </FieldLabel>
                                                <FieldDescription id={`${module.id}-description`}>
                                                    {module.grade} • {module.lessons} lessons
                                                </FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    ))}
                                </FieldGroup>
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
                            <Button variant="outline">Save draft</Button>
                            <Button>Create path</Button>
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
                                        <Select defaultValue="private">
                                            <SelectTrigger id="visibility">
                                                <SelectValue placeholder="Select visibility"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private">Private (draft)</SelectItem>
                                                <SelectItem value="school">School team</SelectItem>
                                                <SelectItem value="public">District-wide</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="path-owner">
                                            Path owner
                                        </FieldLabel>
                                        <Input
                                            id="path-owner"
                                            placeholder="Assign an educator"
                                        />
                                    </Field>
                                    <Field orientation="horizontal" className="items-start">
                                        <Checkbox id="notify-team"/>
                                        <FieldContent>
                                            <FieldLabel htmlFor="notify-team" className="font-medium">
                                                Notify instructional team
                                            </FieldLabel>
                                            <FieldDescription>
                                                Sends a summary email with the path overview.
                                            </FieldDescription>
                                        </FieldContent>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="release-date">
                                            Planned release date
                                        </FieldLabel>
                                        <Input
                                            id="release-date"
                                            type="date"
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
