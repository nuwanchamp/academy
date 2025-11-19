import {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import {Filter, Search} from "lucide-react";
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
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import {cn} from "@/lib/utils.ts";

type StudentListItem = {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name?: string | null;
    grade?: string | null;
    status?: string | null;
    date_of_birth?: string | null;
};

type PaginatedResponse = {
    data: StudentListItem[];
    meta?: {
        current_page?: number;
        last_page?: number;
        total?: number;
    };
    filters?: {
        grades?: string[];
    };
};

const DEFAULT_GRADE_FILTER = "All grades";
const DEFAULT_STATUS_FILTER = "ALL";
const pageSize = 3;

const statusOptions: Array<{value: string; label: string}> = [
    {value: DEFAULT_STATUS_FILTER, label: "All statuses"},
    {value: "active", label: "Active"},
    {value: "onboarding", label: "Onboarding"},
    {value: "archived", label: "Archived"},
];

const statusTone: Record<string, "default" | "secondary" | "outline"> = {
    active: "default",
    onboarding: "secondary",
    archived: "outline",
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

const Students = () => {
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [gradeOptions, setGradeOptions] = useState<string[]>([DEFAULT_GRADE_FILTER]);
    const [search, setSearch] = useState("");
    const [grade, setGrade] = useState(DEFAULT_GRADE_FILTER);
    const [status, setStatus] = useState(DEFAULT_STATUS_FILTER);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const fetchStudents = async (overridePage?: number) => {
        const currentPage = overridePage ?? page;
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(currentPage));
            params.set("per_page", String(pageSize));
            const trimmedSearch = search.trim();
            if (trimmedSearch) {
                params.set("search", trimmedSearch);
            }
            if (grade !== DEFAULT_GRADE_FILTER) {
                params.set("grade", grade);
            }
            if (status !== DEFAULT_STATUS_FILTER) {
                params.set("status", status);
            }

            const url = `/api/v1/students?${params.toString()}`;
            const {data}: {data: PaginatedResponse} = await axios.get(url);
            setStudents(data.data ?? []);
            setMeta({
                current_page: data.meta?.current_page ?? currentPage,
                last_page: data.meta?.last_page ?? 1,
                total: data.meta?.total ?? data.data?.length ?? 0,
            });
            const grades = data.filters?.grades ?? [];
            setGradeOptions([DEFAULT_GRADE_FILTER, ...grades.filter(Boolean)]);
            setError(null);
        } catch (err) {
            setError(axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to load students.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, grade, status]);

    useEffect(() => {
        fetchStudents();
    }, [page]);

    const handleChangePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > meta.last_page) {
            return;
        }
        setPage(nextPage);
        fetchStudents(nextPage);
    };

    const resetFilters = () => {
        setSearch("");
        setGrade(DEFAULT_GRADE_FILTER);
        setStatus(DEFAULT_STATUS_FILTER);
        setFiltersOpen(false);
        setPage(1);
        fetchStudents(1);
    };

    const activeFilters = [
        grade !== DEFAULT_GRADE_FILTER && {label: grade, onRemove: () => setGrade(DEFAULT_GRADE_FILTER)},
        status !== DEFAULT_STATUS_FILTER && {
            label: statusOptions.find((option) => option.value === status)?.label ?? "Status",
            onRemove: () => setStatus(DEFAULT_STATUS_FILTER),
        },
    ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

    const rosterContent = () => {
        if (isLoading) {
            return (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                        <CardTitle className="text-lg text-foreground">Loading your caseload…</CardTitle>
                        <p className="text-sm">Fetching students from the server.</p>
                    </CardContent>
                </Card>
            );
        }

        if (error) {
            return (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent role="alert" className="flex flex-col gap-3 py-8 text-center">
                        <CardTitle className="text-destructive">Unable to load students</CardTitle>
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button variant="outline" onClick={() => fetchStudents()}>
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (students.length === 0) {
            return (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                        <CardTitle className="text-lg text-foreground">No students match your filters yet</CardTitle>
                        <p className="max-w-md text-sm leading-relaxed">
                            Adjust your filters or register a new student to see them listed here.
                        </p>
                        <Button asChild>
                            <Link to="/students/create">Register student</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <>
                <div className="flex flex-col gap-4">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {student.first_name} {student.last_name}
                                        {student.preferred_name && (
                                            <span className="text-muted-foreground"> ({student.preferred_name})</span>
                                        )}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <Badge variant="outline">{student.grade ?? "Grade TBD"}</Badge>
                                        <span>DOB · {formatDate(student.date_of_birth)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={statusTone[(student.status ?? "").toLowerCase()] ?? "outline"}>
                                        {student.status ?? "Not set"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Quick summary
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Keeping {student.first_name}’s plan aligned with grade expectations and weekly
                                        routines. Track new diagnostics from the edit page.
                                    </p>
                                </div>
                                <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Actions
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        <Button asChild variant="link" size="sm" className="px-0 text-primary">
                                            <Link to={`/students/${student.id}`}>Open profile</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/students/${student.id}/edit`}>Edit</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                className={cn(meta.current_page <= 1 && "pointer-events-none opacity-50")}
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleChangePage(meta.current_page - 1);
                                }}
                            />
                        </PaginationItem>
                        {Array.from({length: meta.last_page}).map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        href="#"
                                        isActive={pageNumber === meta.current_page}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleChangePage(pageNumber);
                                        }}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                className={cn(meta.current_page >= meta.last_page && "pointer-events-none opacity-50")}
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleChangePage(meta.current_page + 1);
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </>
        );
    };

    return (
        <div className="space-y-8 text-primary">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeading lead="Learners" title="Student Roster" />
                <Button asChild size="lg">
                    <Link to="/students/create">Register student</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>All students</CardTitle>
                        <CardDescription>
                            Quick overview of student profiles, support plans, and guardian contacts.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by student…"
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="ghost" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-center gap-2 lg:w-auto">
                                    <Filter className="size-4" />
                                    Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-72 space-y-4 p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Grade</p>
                                    <Select value={grade} onValueChange={(value) => setGrade(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Status</p>
                                    <Select value={status} onValueChange={(value) => setStatus(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                                        Clear filters
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Active filters:</span>
                            {activeFilters.map((filter) => (
                                <Badge key={filter.label} variant="secondary" className="gap-2">
                                    {filter.label}
                                    <button
                                        type="button"
                                        onClick={filter.onRemove}
                                        className="text-muted-foreground transition hover:text-primary"
                                        aria-label={`Remove ${filter.label} filter`}
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">{rosterContent()}</div>
        </div>
    );
};

export default Students;
