import axios from "axios";
import {ChangeEvent, FormEvent, useEffect, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {H3} from "@/components/ui/typography/h3.tsx";
import StudentModuleItem from "@/components/ui/StudentModuleItem.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import logoSrc from "../../../assets/profile-girl.svg";

const diagnosisOptions = ["OCD", "ADHD", "Downs Syndrome", "LCD", "ABCD"];

const evaluationOptions = [
    "Student can write without a teacher",
    "Student can read independently",
    "Student can write with guided lines",
    "Student can follow multi-step instructions",
    "Student demonstrates self-regulation",
];

type GuardianLink = {
    id: number;
    name: string;
    email: string;
    pivot?: {
        relationship?: string | null;
        is_primary?: boolean;
        access_level?: string | null;
        notifications_opt_in?: boolean;
    };
    profile?: {
        primary_phone?: string | null;
        address_line1?: string | null;
    };
};

type StudentRecord = {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name?: string | null;
    date_of_birth?: string | null;
    grade?: string | null;
    status?: string | null;
    notes?: string | null;
    assessment_summary?: string | null;
    ieps_or_goals?: string[] | null;
    risk_flags?: string[] | null;
    diagnoses?: string[] | null;
    guardians?: GuardianLink[];
    start_date?: string | null;
    case_manager_id?: number | null;
    teacher_id?: number | null;
};

const STATUS_LABELS: Record<string, string> = {
    onboarding: "Onboarding",
    active: "Active",
    archived: "Archived",
};

const STATUS_TONE: Record<string, "default" | "secondary" | "outline"> = {
    onboarding: "secondary",
    active: "default",
    archived: "outline",
};

const MONTH_OPTIONS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const YEAR_BASE_OPTIONS = ["2024", "2025", "2026", "2027", "2028", "2029"];

type DateParts = {
    year: string;
    month: string;
    day: string;
};

const formatDate = (value?: string | null): string => {
    if (!value) {
        return "—";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
};

const splitDateParts = (value?: string | null): DateParts => {
    if (!value) {
        return {year: "", month: "", day: ""};
    }

    const [year, month, day] = value.split("-");
    return {
        year: year ?? "",
        month: month ?? "",
        day: day ?? "",
    };
};

const composeDate = (parts: DateParts, fallback?: string | null): string | null => {
    if (parts.year && parts.month && parts.day) {
        const day = parts.day.padStart(2, "0");
        return `${parts.year}-${parts.month}-${day}`;
    }

    return fallback ?? null;
};

const parseAssessmentSelections = (value?: string | null): string[] => {
    if (!value) {
        return [];
    }

    return value
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && evaluationOptions.includes(item));
};

const buildErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? error.message ?? "Unable to load student profile.";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to load student profile.";
};

const toDisplayName = (student: StudentRecord | null): string => {
    if (!student) {
        return "Student profile";
    }

    const legalName = `${student.first_name} ${student.last_name}`.trim();
    const preferred = student.preferred_name?.trim();

    if (preferred && preferred.length > 0 && preferred !== legalName) {
        return `${legalName} (${preferred})`;
    }

    return legalName;
};

const capitalize = (value?: string | null): string => {
    if (!value) {
        return "Not set";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

type StudentEditProps = {
    readOnly?: boolean;
};

const StudentEdit = ({readOnly = false}: StudentEditProps) => {
    const {id} = useParams<{id: string}>();
    const [student, setStudent] = useState<StudentRecord | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshIndex, setRefreshIndex] = useState(0);
    const [formValues, setFormValues] = useState({
        first_name: "",
        last_name: "",
        preferred_name: "",
        grade: "",
        status: "",
    });
    const [dobParts, setDobParts] = useState<DateParts>({year: "", month: "", day: ""});
    const [diagnosesList, setDiagnosesList] = useState<string[]>([]);
    const [evaluationSelections, setEvaluationSelections] = useState<string[]>([]);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [guardianForm, setGuardianForm] = useState({
        id: null as number | null,
        name: "",
        relationship: "",
        email: "",
        phone: "",
        address: "",
        access_level: "view",
        is_primary: false,
        notifications_opt_in: true,
    });

    useEffect(() => {
        let isMounted = true;

        const fetchStudent = async () => {
            if (!id) {
                setError("Student ID missing from the route.");
                setIsLoading(false);
                setStudent(null);
                return;
            }

            setIsLoading(true);
            try {
                const {data} = await axios.get<{data: StudentRecord}>(`/api/v1/students/${id}`);
                if (!isMounted) {
                    return;
                }

                setStudent(data.data);
                setError(null);
            } catch (fetchError) {
                if (!isMounted) {
                    return;
                }
                setStudent(null);
                setError(buildErrorMessage(fetchError));
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchStudent().then(()=>{})

        return () => {
            isMounted = false;
        };
    }, [id, refreshIndex]);

    useEffect(() => {
        if (!student) {
            return;
        }

        setFormValues({
            first_name: student.first_name ?? "",
            last_name: student.last_name ?? "",
            preferred_name: student.preferred_name ?? "",
            grade: student.grade ?? "",
            status: student.status ? student.status.toLowerCase() : "",
        });
        setDobParts(splitDateParts(student.date_of_birth));
        setDiagnosesList(student.diagnoses ?? []);
        const parsedAssessments = parseAssessmentSelections(student.assessment_summary);
        const fallbackAssessments = Array.isArray(student.ieps_or_goals)
            ? (student.ieps_or_goals as string[])
            : [];
        setEvaluationSelections(parsedAssessments.length > 0 ? parsedAssessments : fallbackAssessments);

        const guardian = student.guardians?.[0] ?? null;
        setGuardianForm({
            id: guardian?.id ?? null,
            name: guardian?.name ?? "",
            relationship: guardian?.pivot?.relationship ?? "",
            email: guardian?.email ?? "",
            phone: guardian?.profile?.primary_phone ?? "",
            address: guardian?.profile?.address_line1 ?? "",
            access_level: guardian?.pivot?.access_level ?? "view",
            is_primary: Boolean(guardian?.pivot?.is_primary),
            notifications_opt_in: Boolean(guardian?.pivot?.notifications_opt_in ?? true),
        });
    }, [student]);

    const handleInputChange =
        (field: keyof typeof formValues) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setFormValues((previous) => ({
                ...previous,
                [field]: value,
            }));
        };

    const handleStatusChange = (value: string) => {
        setFormValues((previous) => ({
            ...previous,
            status: value,
        }));
    };

    const handleBirthPartChange = (part: keyof DateParts, value: string) => {
        setDobParts((previous) => ({
            ...previous,
            [part]: value,
        }));
    };

    const handleGuardianInput =
        (field: keyof typeof guardianForm) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
            setGuardianForm((previous) => ({
                ...previous,
                [field]: value as never,
            }));
        };

    const handleGuardianSelect = (value: string) => {
        setGuardianForm((previous) => ({
            ...previous,
            access_level: value,
        }));
    };

    const handleDiagnosisToggle = (diagnosis: string, checked: boolean) => {
        setDiagnosesList((previous) => {
            if (checked) {
                if (previous.includes(diagnosis)) {
                    return previous;
                }
                return [...previous, diagnosis];
            }

            return previous.filter((item) => item !== diagnosis);
        });
    };

    const handleEvaluationToggle = (option: string, checked: boolean) => {
        setEvaluationSelections((previous) => {
            if (checked) {
                if (previous.includes(option)) {
                    return previous;
                }
                return [...previous, option];
            }

            return previous.filter((item) => item !== option);
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!student || readOnly) {
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveMessage(null);

        const payload: Record<string, unknown> = {
            first_name: formValues.first_name,
            last_name: formValues.last_name,
            preferred_name: formValues.preferred_name || null,
            grade: formValues.grade,
            status: formValues.status || null,
        };

        const dateValue = composeDate(dobParts, student.date_of_birth ?? null);
        if (dateValue !== null) {
            payload.date_of_birth = dateValue;
        }
        payload.diagnoses = diagnosesList;

        if (evaluationSelections.length > 0) {
            payload.assessment_summary = evaluationSelections.join("\n");
        } else {
            payload.assessment_summary = null;
        }

        if (guardianForm.id) {
            payload.guardians = [
                {
                    id: guardianForm.id,
                    relationship: guardianForm.relationship || null,
                    access_level: guardianForm.access_level,
                    is_primary: guardianForm.is_primary,
                    notifications_opt_in: guardianForm.notifications_opt_in,
                    name: guardianForm.name || null,
                    email: guardianForm.email || null,
                    primary_phone: guardianForm.phone || null,
                    address_line1: guardianForm.address || null,
                },
            ];
        }

        try {
            const {data} = await axios.patch<{data: StudentRecord}>(`/api/v1/students/${student.id}`, payload);
            setStudent(data.data);
            setSaveMessage("Student profile updated.");
        } catch (saveErr) {
            setSaveError(buildErrorMessage(saveErr));
        } finally {
            setIsSaving(false);
        }
    };

    const summary = useMemo(() => {
        const statusValue = (student?.status ?? "").toLowerCase();

        return {
            displayName: toDisplayName(student),
            firstName: student?.preferred_name ?? student?.first_name ?? "Student",
            preferredName: student?.preferred_name ?? null,
            statusValue,
            statusLabel: STATUS_LABELS[statusValue] ?? capitalize(student?.status),
            gradeLabel: student?.grade ?? "Grade TBD",
            dateOfBirthLabel: formatDate(student?.date_of_birth),
            startDateLabel: formatDate(student?.start_date),
            birthDateParts: splitDateParts(student?.date_of_birth),
            diagnoses: diagnosesList,
            iepGoals: evaluationSelections,
            riskFlags: student?.risk_flags ?? [],
            notes: student?.notes ?? "No notes captured yet.",
            assessmentSummary:
                student?.assessment_summary ?? "Assessment summary has not been documented for this learner.",
            guardians: student?.guardians ?? [],
        };
    }, [student, diagnosesList, evaluationSelections]);

    // const primaryGuardian = summary.guardians[0];
    const disableInputs = isLoading || isSaving || readOnly;

    const ReadOnlyValue = ({value, placeholder = "—"}: {value?: string | null; placeholder?: string}) => (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
            {value && String(value).trim().length > 0 ? value : placeholder}
        </div>
    );

    const headline = `${summary.firstName} is currently ${summary.statusLabel.toLowerCase()} in ${summary.gradeLabel}.`;

    const birthYearOptions = useMemo(() => {
        if (dobParts.year && !YEAR_BASE_OPTIONS.includes(dobParts.year)) {
            return [dobParts.year, ...YEAR_BASE_OPTIONS];
        }

        return YEAR_BASE_OPTIONS;
    }, [dobParts.year]);

    if (isLoading) {
        return (
            <div className="flex flex-row gap-4">
                <div className="w-2/3">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/20">
                        <CardContent className="py-16 text-center text-primary">
                            <CardTitle>Loading student profile…</CardTitle>
                            <CardDescription>Pulling the latest information for this learner.</CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-row gap-4">
                <div className="w-2/3">
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">Unable to load student profile</CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={() => setRefreshIndex((index) => index + 1)}>
                                Try again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-4">
            <div className="w-2/3">
                <div className="flex flex-col gap-4">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/20">
                        <CardContent className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <PageHeading lead="Student" title={summary.displayName} />
                                <div className="flex flex-wrap items-center gap-2">
                                    <P className="mb-0">{headline}</P>
                                    <Badge variant="outline">{summary.dateOfBirthLabel}</Badge>
                                </div>
                            </div>
                            <div className="relative h-16 w-40">
                                <img className="absolute -bottom-12 right-0 max-w-70" src={logoSrc} alt="profile" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4" data-testid="student-grade">
                            <P className="mb-1 text-sm text-gray-600">Grade</P>
                            <P className="text-2xl font-bold text-primary">{summary.gradeLabel}</P>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <P className="mb-1 text-sm text-gray-600">Status</P>
                            <Badge
                                data-testid="student-status-badge"
                                variant={STATUS_TONE[summary.statusValue] ?? "outline"}
                            >
                                {summary.statusLabel}
                            </Badge>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <P className="mb-1 text-sm text-gray-600">Date of Birth</P>
                            <P className="text-2xl font-bold text-primary">{summary.dateOfBirthLabel}</P>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <P className="mb-1 text-sm text-gray-600">Start Date</P>
                            <P className="text-2xl font-bold text-primary">{summary.startDateLabel}</P>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="mt-2">
                        <TabsList>
                            <TabsTrigger value="overview">Details</TabsTrigger>
                            <TabsTrigger value="modules">Modules</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-row justify-between gap-2">
                                        <div>
                                            <CardTitle>Information</CardTitle>
                                            <CardDescription>
                                                Make changes to student&apos;s information here. Click save when you&apos;re
                                                done.
                                            </CardDescription>
                                        </div>
                                        {student && (
                                            readOnly ? (
                                                <Button asChild>
                                                    <Link to={`/students/${student.id}/edit`}>Edit profile</Link>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" asChild>
                                                    <Link to={`/students/${student.id}`}>Cancel</Link>
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </CardHeader>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="grid gap-6">
                                        <FieldGroup>
                                            <FieldSet>
                                                <FieldGroup>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Field>
                                                            <FieldLabel htmlFor="student-name">Student Name *</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={formValues.first_name} />
                                                            ) : (
                                                                <Input
                                                                    id="student-name"
                                                                    placeholder="Student name"
                                                                    required
                                                                    value={formValues.first_name}
                                                                    onChange={handleInputChange("first_name")}
                                                                    disabled={disableInputs}
                                                                />
                                                            )}
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="grade">Grade *</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={formValues.grade} />
                                                            ) : (
                                                                <Input
                                                                    id="grade"
                                                                    placeholder="Grade"
                                                                    required
                                                                    value={formValues.grade}
                                                                    onChange={handleInputChange("grade")}
                                                                    disabled={disableInputs}
                                                                />
                                                            )}
                                                        </Field>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Field>
                                                            <FieldLabel htmlFor="student-preferred-name">
                                                                Preferred Name
                                                            </FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={formValues.preferred_name} />
                                                            ) : (
                                                                <Input
                                                                    id="student-preferred-name"
                                                                    placeholder="Preferred name"
                                                                    value={formValues.preferred_name}
                                                                    onChange={handleInputChange("preferred_name")}
                                                                    disabled={disableInputs}
                                                                />
                                                            )}
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="status-select">Status</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={summary.statusLabel} />
                                                            ) : (
                                                                <Select
                                                                    value={formValues.status || undefined}
                                                                    onValueChange={handleStatusChange}
                                                                    disabled={disableInputs}
                                                                >
                                                                    <SelectTrigger id="status-select">
                                                                        <SelectValue placeholder="Select status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                                            <SelectItem key={value} value={value}>
                                                                                {label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </Field>
                                                    </div>
                                                    <FieldLabel className="mt-4" htmlFor="student-birthday">
                                                        Birth Day *
                                                    </FieldLabel>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <Field>
                                                            <FieldLabel htmlFor="birth-year">Year</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={dobParts.year} placeholder="YYYY" />
                                                            ) : (
                                                                <Select
                                                                    value={dobParts.year || undefined}
                                                                    onValueChange={(value) => handleBirthPartChange("year", value)}
                                                                    disabled={disableInputs}
                                                                >
                                                                    <SelectTrigger id="birth-year">
                                                                        <SelectValue placeholder="YYYY" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {birthYearOptions.map((option) => (
                                                                            <SelectItem key={option} value={option}>
                                                                                {option}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="birth-month">Month</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={dobParts.month} placeholder="MM" />
                                                            ) : (
                                                                <Select
                                                                    value={dobParts.month || undefined}
                                                                    onValueChange={(value) => handleBirthPartChange("month", value)}
                                                                    disabled={disableInputs}
                                                                >
                                                                    <SelectTrigger id="birth-month">
                                                                        <SelectValue placeholder="MM" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {MONTH_OPTIONS.map((option) => (
                                                                            <SelectItem key={option} value={option}>
                                                                                {option}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </Field>
                                                        <Field>
                                                            <FieldLabel htmlFor="birth-day">Day</FieldLabel>
                                                            {readOnly ? (
                                                                <ReadOnlyValue value={dobParts.day} placeholder="DD" />
                                                            ) : (
                                                                <Input
                                                                    id="birth-day"
                                                                    placeholder="DD"
                                                                    value={dobParts.day}
                                                                    onChange={(event) => handleBirthPartChange("day", event.target.value)}
                                                                    disabled={disableInputs}
                                                                />
                                                            )}
                                                        </Field>
                                                    </div>
                                                </FieldGroup>
                                            <FieldGroup className="mt-6">
                                                <FieldLabel>Diagnoses</FieldLabel>
                                                {readOnly ? (
                                                    diagnosesList.length === 0 ? (
                                                        <P className="text-sm text-muted-foreground">
                                                            No diagnoses recorded yet.
                                                        </P>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {diagnosesList.map((diagnosis) => (
                                                                <Badge key={diagnosis} variant="secondary">
                                                                    {diagnosis}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {diagnosisOptions.map((option) => (
                                                            <Field orientation="horizontal" key={option}>
                                                                <Checkbox
                                                                    id={`diagnosis-${option}`}
                                                                    checked={diagnosesList.includes(option)}
                                                                    disabled={disableInputs}
                                                                    onCheckedChange={(checked) =>
                                                                        handleDiagnosisToggle(option, Boolean(checked))
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
                                                )}
                                            </FieldGroup>
                                            </FieldSet>
                                            <FieldSeparator />
                                            <FieldSet>
                                                <FieldLegend>Initial Evaluation</FieldLegend>
                                                <FieldDescription>
                                                    Provided initial evaluation based on the parents&apos; insights.
                                                </FieldDescription>
                                                {readOnly ? (
                                                    evaluationSelections.length === 0 ? (
                                                        <P className="text-sm text-muted-foreground">
                                                            No observations captured yet.
                                                        </P>
                                                    ) : (
                                                        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                                                            {evaluationSelections.map((item) => (
                                                                <li key={item}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    )
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {evaluationOptions.map((option) => (
                                                            <Field orientation="horizontal" key={option}>
                                                                <Checkbox
                                                                    id={`evaluation-${option}`}
                                                                    checked={evaluationSelections.includes(option)}
                                                                    disabled={disableInputs}
                                                                    onCheckedChange={(checked) =>
                                                                        handleEvaluationToggle(option, Boolean(checked))
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
                                                )}
                                            </FieldSet>
                                        </FieldGroup>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="text-sm">
                                            {saveMessage && <p className="text-green-600">{saveMessage}</p>}
                                            {saveError && <p className="text-red-600">{saveError}</p>}
                                        </div>
                                        {student && (
                                            readOnly ? (
                                                <Button asChild>
                                                    <Link to={`/students/${student.id}/edit`}>Edit profile</Link>
                                                </Button>
                                            ) : (
                                                <Button type="submit" disabled={disableInputs}>
                                                    {isSaving ? "Saving..." : "Save changes"}
                                                </Button>
                                            )
                                        )}
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                        <TabsContent value="modules">
                            <div className="mt-6 flex w-full flex-col gap-6">
                                <StudentModuleItem
                                    name="Number System"
                                    status="completed"
                                    description="Learn the basics of number system."
                                    id="1"
                                />
                                <StudentModuleItem
                                    name="Phonics Basics"
                                    status="active"
                                    description="Sound recognition and letter combinations"
                                    id="2"
                                />
                                <StudentModuleItem
                                    name="Life Skills: Daily Routines"
                                    status="active"
                                    description="Understanding morning and evening routines"
                                    id="3"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="flex w-1/3 flex-col gap-4 rounded-xl bg-gray-100 p-4">
                <Card className="bg-destructive/45 text-white">
                    <CardHeader>
                        <H3 className="text-white">Parent&apos;s Note</H3>
                    </CardHeader>
                    <CardContent>
                        <P>{summary.notes}</P>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex flex-row justify-between gap-2">
                            <H3>Parent Information</H3>
                            {student && (
                                readOnly ? (
                                    <Button asChild>
                                        <Link to={`/students/${student.id}/edit`}>Edit profile</Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" asChild>
                                        <Link to={`/students/${student.id}`}>Cancel</Link>
                                    </Button>
                                )
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <form className="my-6" key={guardianForm.id ?? "guardian-form"}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="parent-name">Parent Name *</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.name} />
                                        ) : (
                                            <Input
                                                id="parent-name"
                                                placeholder="Parent name"
                                                required
                                                value={guardianForm.name}
                                                onChange={handleGuardianInput("name")}
                                                disabled={disableInputs}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-address">Address</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.address} />
                                        ) : (
                                            <Input
                                                id="parent-address"
                                                placeholder="Address"
                                                value={guardianForm.address}
                                                onChange={handleGuardianInput("address")}
                                                disabled={disableInputs}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-phone">Phone *</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.phone} />
                                        ) : (
                                            <Input
                                                id="parent-phone"
                                                placeholder="(555) 555-1234"
                                                value={guardianForm.phone}
                                                onChange={handleGuardianInput("phone")}
                                                disabled={disableInputs}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-email">Email</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.email} />
                                        ) : (
                                            <Input
                                                id="parent-email"
                                                type="email"
                                                placeholder="parent@example.com"
                                                value={guardianForm.email}
                                                onChange={handleGuardianInput("email")}
                                                disabled={disableInputs}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-relationship">Relationship</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.relationship} />
                                        ) : (
                                            <Input
                                                id="parent-relationship"
                                                placeholder="Relationship"
                                                value={guardianForm.relationship}
                                                onChange={handleGuardianInput("relationship")}
                                                disabled={disableInputs}
                                            />
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="parent-access">Access Level</FieldLabel>
                                        {readOnly ? (
                                            <ReadOnlyValue value={guardianForm.access_level} />
                                        ) : (
                                            <Select
                                                value={guardianForm.access_level}
                                                onValueChange={handleGuardianSelect}
                                                disabled={disableInputs}
                                            >
                                                <SelectTrigger id="parent-access">
                                                    <SelectValue placeholder="Select access" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="view">View only</SelectItem>
                                                    <SelectItem value="comment">Can comment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </Field>
                                    <div className="flex flex-col gap-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {readOnly ? (
                                                <ReadOnlyValue
                                                    value={guardianForm.is_primary ? "Yes" : "No"}
                                                    placeholder="No"
                                                />
                                            ) : (
                                                <Switch
                                                    id="primary-guardian"
                                                    checked={guardianForm.is_primary}
                                                    onCheckedChange={(checked) =>
                                                        setGuardianForm((previous) => ({
                                                            ...previous,
                                                            is_primary: checked,
                                                        }))
                                                    }
                                                    disabled={disableInputs}
                                                />
                                            )}
                                            <FieldLabel htmlFor="primary-guardian">Primary guardian</FieldLabel>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {readOnly ? (
                                                <ReadOnlyValue
                                                    value={guardianForm.notifications_opt_in ? "Opted in" : "Opted out"}
                                                />
                                            ) : (
                                                <Switch
                                                    id="guardian-notifications"
                                                    checked={guardianForm.notifications_opt_in}
                                                    onCheckedChange={(checked) =>
                                                        setGuardianForm((previous) => ({
                                                            ...previous,
                                                            notifications_opt_in: checked,
                                                        }))
                                                    }
                                                    disabled={disableInputs}
                                                />
                                            )}
                                            <FieldLabel htmlFor="guardian-notifications">
                                                Receive notifications
                                            </FieldLabel>
                                        </div>
                                    </div>
                                </FieldGroup>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentEdit;
