import {FormEvent, useEffect, useMemo, useState} from "react";
import axios, {AxiosError} from "axios";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Check,
    ChevronsUpDown,
    LucideCircleX,
    LucidePlus,
} from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import {cn} from "@/lib/utils.ts";
import {H3} from "@/components/ui/typography/h3.tsx";
import DownloadableMaterial from "@/components/ui/DownloadableMaterial.tsx";
import {fetchParents, ParentOption} from "@/lib/api.ts";
import type {CheckedState} from "@radix-ui/react-checkbox";
import {useTaxonomies} from "@/features/settings/hooks/useTaxonomies.ts";

const initialParentOptions: ParentOption[] = [];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 30;
const yearOptions = Array.from({length: YEAR_RANGE}, (_, index) =>
    String(CURRENT_YEAR - index),
);

const monthOptions = [
    {value: "01", label: "01 - Jan"},
    {value: "02", label: "02 - Feb"},
    {value: "03", label: "03 - Mar"},
    {value: "04", label: "04 - Apr"},
    {value: "05", label: "05 - May"},
    {value: "06", label: "06 - Jun"},
    {value: "07", label: "07 - Jul"},
    {value: "08", label: "08 - Aug"},
    {value: "09", label: "09 - Sep"},
    {value: "10", label: "10 - Oct"},
    {value: "11", label: "11 - Nov"},
    {value: "12", label: "12 - Dec"},
];

const dayOptions = Array.from({length: 31}, (_, index) =>
    String(index + 1).padStart(2, "0"),
);

const parentDrawerInitialState = {
    fullName: "",
    address: "",
    primaryPhone: "",
    email: "",
    password: "",
    invite: true,
};
type ParentFormState = typeof parentDrawerInitialState;

const parseFullName = (fullName: string): {first: string; last: string} => {
    const trimmed = fullName.trim();
    if (!trimmed) {
        return {first: "", last: ""};
    }

    const [first, ...rest] = trimmed.split(/\s+/);
    return {
        first,
        last: rest.join(" ") || first,
    };
};

type ValidationErrorBag = Record<string, string[]>;
type FeedbackState = {type: "success" | "error"; message: string} | null;

const resolveStoredUserId = (): string => {
    if (typeof window === "undefined") {
        return "";
    }

    const stored = window.localStorage.getItem("rr_user");
    if (!stored) {
        return "";
    }

    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.id === "number") {
            return String(parsed.id);
        }
    } catch (error) {
        console.warn("Unable to parse rr_user from localStorage", error);
    }

    return "";
};

const splitName = (fullName: string): {first: string; last: string} => {
    const cleaned = fullName.trim();
    if (!cleaned) {
        return {first: "", last: ""};
    }

    const [first, ...rest] = cleaned.split(/\s+/);
    return {
        first,
        last: rest.join(" ") || first,
    };
};

const StudentCreatePage = () => {
    const {diagnoses, evaluations} = useTaxonomies();
    const storedUserId = useMemo(resolveStoredUserId, []);
    const [parentSelectOpen, setParentSelectOpen] = useState(false);
    const [parentOptions, setParentOptions] = useState<ParentOption[]>(initialParentOptions);
    const [selectedParentId, setSelectedParentId] = useState("");
    const [parentDrawerOpen, setParentDrawerOpen] = useState(false);
    const [parentForm, setParentForm] = useState<ParentFormState>(parentDrawerInitialState);
    const [parentFormErrors, setParentFormErrors] = useState<Record<string, string>>({});
    const [isParentSubmitting, setIsParentSubmitting] = useState(false);
    const [parentFeedback, setParentFeedback] = useState<string | null>(null);
    const [studentName, setStudentName] = useState("");
    const [studentGrade, setStudentGrade] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [diagnosesSelections, setDiagnosesSelections] = useState<string[]>([]);
    const [assessmentSelections, setAssessmentSelections] = useState<string[]>([]);
    const [parentNote, setParentNote] = useState("");
    const [parentRelationship, setParentRelationship] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const caseManagerId = storedUserId;
    const teacherId = storedUserId;

    const handleDiagnosisChange = (value: string, checked: CheckedState) => {
        setDiagnosesSelections((prev) => {
            if (checked === true) {
                return prev.includes(value) ? prev : [...prev, value];
            }
            return prev.filter((item) => item !== value);
        });
    };

    const handleAssessmentChange = (value: string, checked: CheckedState) => {
        setAssessmentSelections((prev) => {
            if (checked === true) {
                return prev.includes(value) ? prev : [...prev, value];
            }
            return prev.filter((item) => item !== value);
        });
    };

    useEffect(() => {
        let isMounted = true;

        fetchParents()
            .then((options) => {
                if (isMounted) {
                    setParentOptions((prev) => {
                        const existing = new Set(prev.map((option) => option.value));
                        const merged = [...prev];
                        options.forEach((option) => {
                            if (!existing.has(option.value)) {
                                merged.push(option);
                            }
                        });
                        return merged;
                    });
                }
            })
            .catch(() => {
                // Non-blocking: keep fallback options empty
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const fieldError = (fields: string | string[]): string | null => {
        const keys = Array.isArray(fields) ? fields : [fields];
        for (const key of keys) {
            const message = formErrors[key];
            if (message) {
                return message;
            }
        }
        return null;
    };

    const mapValidationErrors = (bag: ValidationErrorBag | undefined): Record<string, string> => {
        if (!bag) {
            return {};
        }

        return Object.entries(bag).reduce<Record<string, string>>((acc, [key, messages]) => {
            const normalizedKey = key.startsWith("guardians") ? "guardians" : key;
            if (messages?.length) {
                acc[normalizedKey] = messages[0];
            }
            return acc;
        }, {});
    };

    const toAxiosError = (
        error: unknown,
    ): AxiosError<{message?: string; errors?: ValidationErrorBag}> | null => {
        if (axios.isAxiosError(error)) {
            return error as AxiosError<{message?: string; errors?: ValidationErrorBag}>;
        }
        if (typeof error === "object" && error !== null && "response" in error) {
            return error as AxiosError<{message?: string; errors?: ValidationErrorBag}>;
        }
        return null;
    };

    const summarizeError = (error: unknown): string => {
        const axiosError = toAxiosError(error);
        const responseMessage = axiosError?.response?.data?.message;
        if (typeof responseMessage === "string" && responseMessage.trim().length > 0) {
            return responseMessage;
        }
        return "Unable to save the student profile. Please try again.";
    };

    const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);
        setFormErrors({});

        const {first, last} = splitName(studentName);
        const errors: Record<string, string> = {};

        if (!first) {
            errors.first_name = "Student name is required.";
        }
        if (!studentGrade.trim()) {
            errors.grade = "Grade is required.";
        }
        if (!birthYear || !birthMonth || !birthDay) {
            errors.date_of_birth = "Complete the birth date.";
        }
        if (!caseManagerId) {
            errors.case_manager_id = "You must be assigned as a case manager.";
        }

        if (Object.keys(errors).length) {
            setFormErrors(errors);
            setFeedback({type: "error", message: "Please correct the highlighted fields."});
            setIsSubmitting(false);
            return;
        }

        const formattedDate = `${birthYear}-${birthMonth}-${birthDay.padStart(2, "0")}`;

        try {
            const payload: Record<string, unknown> = {
                first_name: first,
                last_name: last,
                grade: studentGrade,
                date_of_birth: formattedDate,
                case_manager_id: Number(caseManagerId),
                teacher_id: Number(teacherId),
                status: "onboarding",
            };

            if (diagnosesSelections.length > 0) {
                payload.diagnoses = diagnosesSelections;
            }

            if (assessmentSelections.length > 0) {
                payload.assessment_summary = assessmentSelections.join("\n");
            }

            if (parentNote.trim().length > 0) {
                payload.notes = parentNote.trim();
            }

            if (selectedParentId) {
                payload.guardians = [
                    {
                        id: Number(selectedParentId),
                        relationship: parentRelationship || null,
                        is_primary: true,
                        access_level: "view",
                        notifications_opt_in: true,
                    },
                ];
            }

            await axios.post("/api/v1/students", payload);

            setFeedback({type: "success", message: "Student profile created successfully."});
            setStudentName("");
            setStudentGrade("");
            setBirthYear("");
            setBirthMonth("");
            setBirthDay("");
            setDiagnosesSelections([]);
            setAssessmentSelections([]);
            setParentNote("");
            setParentRelationship("");
        } catch (error) {
            const axiosError = toAxiosError(error);
            if (axiosError?.response?.status === 422) {
                const mapped = mapValidationErrors(axiosError.response.data?.errors);
                setFormErrors(mapped);
                setFeedback({type: "error", message: "Please correct the highlighted fields."});
            } else {
                setFeedback({type: "error", message: summarizeError(error)});
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleParentSubmit = async () => {
        setIsParentSubmitting(true);
        setParentFeedback(null);
        setParentFormErrors({});

        const {first, last} = parseFullName(parentForm.fullName);
        const errors: Record<string, string> = {};

        if (!first) {
            errors.fullName = "Parent name is required.";
        }
        if (!parentForm.email.trim()) {
            errors.email = "Email is required.";
        }
        if (!parentForm.primaryPhone.trim()) {
            errors.primaryPhone = "Phone number is required.";
        }

        if (Object.keys(errors).length > 0) {
            setParentFormErrors(errors);
            setIsParentSubmitting(false);
            return;
        }

        try {
            const response = await axios.post("/api/v1/parents", {
                first_name: first,
                last_name: last,
                email: parentForm.email,
                password: parentForm.password || undefined,
                primary_phone: parentForm.primaryPhone,
                address_line1: parentForm.address || undefined,
                send_portal_invite: parentForm.invite,
            });

            const createdUser = response.data?.data?.user;
            if (createdUser) {
                const optionLabel =
                    createdUser.name
                    || `${createdUser.first_name ?? ""} ${createdUser.last_name ?? ""}`.trim()
                    || createdUser.email;
                const option = {
                    id: Number(createdUser.id),
                    value: String(createdUser.id),
                    label: optionLabel,
                    email: createdUser.email ?? "",
                };

                setParentOptions((prev) => {
                    const filtered = prev.filter((item) => item.value !== option.value);
                    return [...filtered, option];
                });
                setSelectedParentId(option.value);
            }

            setParentDrawerOpen(false);
            setParentForm(parentDrawerInitialState);
            setParentFormErrors({});
            setParentFeedback(null);
        } catch (error) {
            const axiosError = toAxiosError(error);
            if (axiosError?.response?.status === 422) {
                setParentFormErrors(mapValidationErrors(axiosError.response.data?.errors));
                setParentFeedback("Please correct the highlighted fields.");
            } else {
                setParentFeedback("Unable to create parent profile. Please try again.");
            }
        } finally {
            setIsParentSubmitting(false);
        }
    };

    return (
        <>
            <div className={"text-primary"}>
                <PageHeading lead={"New"} title={"Student Registration"} />
            </div>
            {feedback && (
                <div
                    role="alert"
                    className={
                        feedback.type === "success"
                            ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900"
                            : "mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900"
                    }
                >
                    {feedback.message}
                </div>
            )}
            <div className={"w-full flex gap-4 flex-row justify-between items-start mt-6"}>
                <div className={"w-2/3"}>
                    <Card>
                        <CardContent>
                            <div>
                                <form onSubmit={handleSubmit}>
                                    <FieldGroup>
                                        <FieldSet>
                                            <FieldLegend>Student Details</FieldLegend>
                                            <FieldDescription>
                                                Required fields are marked with an asterisk (*)
                                            </FieldDescription>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="student-name">
                                                        Student Name *
                                                    </FieldLabel>
                                                    <Input
                                                        id="student-name"
                                                        placeholder="Evil Rabbit"
                                                        value={studentName}
                                                        onChange={(event) => setStudentName(event.target.value)}
                                                        required
                                                    />
                                                    {fieldError(["first_name", "last_name"]) && (
                                                        <p className="text-sm text-red-600">
                                                            {fieldError(["first_name", "last_name"])}
                                                        </p>
                                                    )}
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="grade">
                                                        Grade *
                                                    </FieldLabel>
                                                    <Input
                                                        id="grade"
                                                        placeholder=" Grade 4"
                                                        value={studentGrade}
                                                        onChange={(event) => setStudentGrade(event.target.value)}
                                                        required
                                                    />
                                                    {fieldError("grade") && (
                                                        <p className="text-sm text-red-600">{fieldError("grade")}</p>
                                                    )}
                                                </Field>
                                                <p className="text-sm font-medium text-foreground">
                                                    Birth Day *
                                                </p>
                                                <div className="grid grid-cols-3 -mt-2 gap-4">
                                                    <Field>
                                                        <FieldLabel htmlFor="year">
                                                            Year
                                                        </FieldLabel>
                                                        <Select value={birthYear} onValueChange={setBirthYear}>
                                                            <SelectTrigger id="year" data-testid="dob-year">
                                                                <SelectValue placeholder="YYYY" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                                {yearOptions.map((year) => (
                                                                    <SelectItem key={year} value={year}>
                                                                        {year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="month">
                                                            Month
                                                        </FieldLabel>
                                                        <Select value={birthMonth} onValueChange={setBirthMonth}>
                                                            <SelectTrigger id="month" data-testid="dob-month">
                                                                <SelectValue placeholder="MM" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                                {monthOptions.map((month) => (
                                                                    <SelectItem key={month.value} value={month.value}>
                                                                        {month.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="day">Day</FieldLabel>
                                                        <Select value={birthDay} onValueChange={setBirthDay}>
                                                            <SelectTrigger id="day" data-testid="dob-day">
                                                                <SelectValue placeholder="DD" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                                {dayOptions.map((day) => (
                                                                    <SelectItem key={day} value={day}>
                                                                        {day}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                </div>
                                                {fieldError("date_of_birth") && (
                                                    <p className="text-sm text-red-600 mt-2">
                                                        {fieldError("date_of_birth")}
                                                    </p>
                                                )}
                                            </FieldGroup>
                                            <FieldGroup>
                                                <FieldLabel>
                                                    Diagnose
                                                </FieldLabel>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {(diagnoses.length ? diagnoses : []).map((option) => (
                                                        <Field orientation="horizontal" key={option}>
                                                            <Checkbox
                                                                id={`diagnosis-${option}`}
                                                                checked={diagnosesSelections.includes(option)}
                                                                onCheckedChange={(checked) =>
                                                                    handleDiagnosisChange(option, checked)
                                                                }
                                                            />
                                                            <FieldLabel
                                                                htmlFor={`diagnosis-${option}`}
                                                                className="font-normal"
                                                            >
                                                                {option}
                                                            </FieldLabel>
                                                        </Field>
                                                    ))}
                                                </div>
                                                {fieldError("diagnoses") && (
                                                    <p className="text-sm text-red-600">{fieldError("diagnoses")}</p>
                                                )}
                                            </FieldGroup>
                                        </FieldSet>
                                        <FieldSeparator />
                                        <FieldSet>
                                            <FieldLegend>Initial Evaluation</FieldLegend>
                                            <FieldDescription>
                                                Select observations that best describe the student's current abilities.
                                            </FieldDescription>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(evaluations.length ? evaluations : []).map((option) => (
                                                    <Field orientation="horizontal" key={option}>
                                                        <Checkbox
                                                            id={`evaluation-${option}`}
                                                            checked={assessmentSelections.includes(option)}
                                                            onCheckedChange={(checked) =>
                                                                handleAssessmentChange(option, checked)
                                                            }
                                                        />
                                                        <FieldLabel
                                                            htmlFor={`evaluation-${option}`}
                                                            className="font-normal"
                                                        >
                                                            {option}
                                                        </FieldLabel>
                                                    </Field>
                                                ))}
                                            </div>
                                            {fieldError("assessment_summary") && (
                                                <p className="text-sm text-red-600">
                                                    {fieldError("assessment_summary")}
                                                </p>
                                            )}
                                        </FieldSet>
                                        <FieldSet>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="checkout-7j9-optional-comments">
                                                        Parent's Note
                                                    </FieldLabel>
                                                    <Textarea
                                                        id="checkout-7j9-optional-comments"
                                                        placeholder="Add any additional comments"
                                                        className="resize-none"
                                                        value={parentNote}
                                                        onChange={(event) => setParentNote(event.target.value)}
                                                    />
                                                    {fieldError("notes") && (
                                                        <p className="text-sm text-red-600">{fieldError("notes")}</p>
                                                    )}
                                                </Field>
                                            </FieldGroup>
                                        </FieldSet>
                                        <Field orientation="horizontal">
                                            <Button type="submit">Submit</Button>
                                            <Button variant="outline" type="button">
                                                Cancel
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className={"w-1/3 bg-gray-100 flex flex-col gap-4 p-4 rounded-xl"}>
                    <Card>
                        <CardContent>
                            <form>
                                <FieldGroup>
                                    <FieldSet>
                                        <FieldLegend>Parent Details</FieldLegend>
                                        <FieldDescription>
                                            Choose an existing parent or create a new one.
                                        </FieldDescription>
                                        <FieldGroup>
                                            <FieldSet>
                                                <Field>
                                                    <div className={"flex items-center gap-2 flex-row justify-between"}>
                                                        <FieldLabel htmlFor="">
                                                            Parent
                                                        </FieldLabel>

                                                        <Sheet open={parentDrawerOpen}
                                                               onOpenChange={setParentDrawerOpen}>
                                                            <SheetTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    type="button"
                                                                    onClick={() => setParentDrawerOpen(true)}
                                                                    className="group hover:bg-primary hover:text-white"
                                                                    aria-label="Add parent"
                                                                >
                                                                    <LucidePlus
                                                                        className="text-primary group-hover:text-white" />
                                                                </Button>
                                                            </SheetTrigger>
                                                            <SheetContent className={"text-primary"}>
                                                                <SheetHeader>
                                                                    <SheetTitle>New Parent</SheetTitle>
                                                                    <SheetDescription>
                                                                        Add a new parent here. Click save when you&apos;re
                                                                        done.
                                                                    </SheetDescription>
                                                                </SheetHeader>
                                                                <form className="my-6 space-y-4" onSubmit={(event) => {
                                                                    event.preventDefault();
                                                                    handleParentSubmit();
                                                                }}>
                                                                    {parentFeedback && (
                                                                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                                                                            {parentFeedback}
                                                                        </div>
                                                                    )}
                                                                    <FieldGroup>
                                                                        <Field>
                                                                            <FieldLabel htmlFor="parent-full-name">
                                                                                Parent Name *
                                                                            </FieldLabel>
                                                                            <Input
                                                                                id="parent-full-name"
                                                                                placeholder="Leah Mendoza"
                                                                                value={parentForm.fullName}
                                                                                onChange={(event) => setParentForm((prev) => ({
                                                                                    ...prev,
                                                                                    fullName: event.target.value,
                                                                                }))}
                                                                            />
                                                                            {parentFormErrors.fullName && (
                                                                                <p className="text-sm text-red-600">
                                                                                    {parentFormErrors.fullName}
                                                                                </p>
                                                                            )}
                                                                        </Field>
                                                                        <Field>
                                                                            <FieldLabel htmlFor="parent-address">
                                                                                Address
                                                                            </FieldLabel>
                                                                            <Input
                                                                                id="parent-address"
                                                                                placeholder="123 Rainbow Rd."
                                                                                value={parentForm.address}
                                                                                onChange={(event) => setParentForm((prev) => ({
                                                                                    ...prev,
                                                                                    address: event.target.value,
                                                                                }))}
                                                                            />
                                                                        </Field>
                                                                        <Field>
                                                                            <FieldLabel htmlFor="parent-phone">
                                                                                Phone *
                                                                            </FieldLabel>
                                                                            <Input
                                                                                id="parent-phone"
                                                                                placeholder="+1 555-123-4567"
                                                                                value={parentForm.primaryPhone}
                                                                                onChange={(event) => setParentForm((prev) => ({
                                                                                    ...prev,
                                                                                    primaryPhone: event.target.value,
                                                                                }))}
                                                                            />
                                                                            {parentFormErrors.primaryPhone && (
                                                                                <p className="text-sm text-red-600">
                                                                                    {parentFormErrors.primaryPhone}
                                                                                </p>
                                                                            )}
                                                                        </Field>
                                                                        <Field>
                                                                            <FieldLabel htmlFor="parent-email">
                                                                                Email *
                                                                            </FieldLabel>
                                                                            <Input
                                                                                id="parent-email"
                                                                                type="email"
                                                                                placeholder="parent@example.com"
                                                                                value={parentForm.email}
                                                                                onChange={(event) => setParentForm((prev) => ({
                                                                                    ...prev,
                                                                                    email: event.target.value,
                                                                                }))}
                                                                            />
                                                                            {parentFormErrors.email && (
                                                                                <p className="text-sm text-red-600">
                                                                                    {parentFormErrors.email}
                                                                                </p>
                                                                            )}
                                                                        </Field>
                                                                        <Field>
                                                                            <FieldLabel htmlFor="parent-password">
                                                                                Temporary Password
                                                                            </FieldLabel>
                                                                            <Input
                                                                                id="parent-password"
                                                                                name="password"
                                                                                type="password"
                                                                                placeholder="Auto-generated if left blank"
                                                                                value={parentForm.password}
                                                                                onChange={(event) => setParentForm((prev) => ({
                                                                                    ...prev,
                                                                                    password: event.target.value,
                                                                                }))}
                                                                            />
                                                                        </Field>
                                                                        <Field orientation="horizontal">
                                                                            <Checkbox
                                                                                id="parent-invite"
                                                                                checked={parentForm.invite}
                                                                                onCheckedChange={(checked) =>
                                                                                    setParentForm((prev) => ({
                                                                                        ...prev,
                                                                                        invite: checked === true,
                                                                                    }))
                                                                                }
                                                                            />
                                                                            <FieldLabel htmlFor="parent-invite"
                                                                                        className="font-normal">
                                                                                Send portal invitation email
                                                                            </FieldLabel>
                                                                        </Field>
                                                                    </FieldGroup>
                                                                    <SheetFooter>
                                                                        <Button
                                                                            type="submit"
                                                                            disabled={isParentSubmitting}
                                                                        >
                                                                            {isParentSubmitting ? "Saving..." : "Save parent"}
                                                                        </Button>
                                                                        <SheetClose asChild>
                                                                            <Button variant="outline" type="button">
                                                                                <LucideCircleX />
                                                                            </Button>
                                                                        </SheetClose>
                                                                    </SheetFooter>
                                                                </form>
                                                            </SheetContent>
                                                        </Sheet>
                                                    </div>
                                                    <Popover open={parentSelectOpen}
                                                             onOpenChange={setParentSelectOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={parentSelectOpen}
                                                                className="w-[200px] justify-between"
                                                                data-testid="parent-select-trigger"
                                                            >
                                                                {selectedParentId
                                                                    ? parentOptions.find((parent) => parent.value === selectedParentId)?.label
                                                                    : "Select a Parent..."}
                                                                <ChevronsUpDown className="opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search Parents..."
                                                                              className="h-9" />
                                                            <CommandList className="max-h-60 overflow-y-auto">
                                                                    <CommandEmpty>No parent found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {parentOptions.map((parent) => (
                                                                            <CommandItem
                                                                                key={parent.value}
                                                                                value={parent.label}
                                                                                onSelect={() => {
                                                                                    const nextValue = parent.value === selectedParentId ? "" : parent.value;
                                                                                    setSelectedParentId(nextValue);
                                                                                    setParentSelectOpen(false);
                                                                                }}
                                                                            >
                                                                                {parent.label}
                                                                                <Check
                                                                                    className={cn(
                                                                                        "ml-auto",
                                                                                        selectedParentId === parent.value ? "opacity-100" : "opacity-0",
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="parent-relationship">
                                                        Relationship *
                                                    </FieldLabel>
                                                    <Select
                                                        value={parentRelationship}
                                                        onValueChange={setParentRelationship}
                                                    >
                                                        <SelectTrigger id="parent-relationship">
                                                            <SelectValue placeholder="Select Relationship" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Father">Father</SelectItem>
                                                            <SelectItem value="Mother">Mother</SelectItem>
                                                            <SelectItem value="Guardian">Guardian</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </FieldSet>

                                        </FieldGroup>
                                    </FieldSet>
                                </FieldGroup>
                                {fieldError("guardians") && (
                                    <p className="text-sm text-red-600">{fieldError("guardians")}</p>
                                )}
                                {fieldError("case_manager_id") && (
                                    <p className="text-sm text-red-600">{fieldError("case_manager_id")}</p>
                                )}
                                <div className="mt-6 flex justify-end">
                                    <Button type="button" disabled={isSubmitting} onClick={() => handleSubmit()}>
                                        {isSubmitting ? "Saving..." : "Save student"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    <H3>Documents</H3>
                    <Card>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <DownloadableMaterial name={"Application form"} link={"#"} />
                                <DownloadableMaterial name={"Evaluation Form"} link={"#"} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default StudentCreatePage;
