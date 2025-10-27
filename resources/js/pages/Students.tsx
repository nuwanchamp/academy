import {useEffect, useMemo, useState} from "react";
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

const students = [
    {
        id: 1,
        name: "Avery Chen",
        grade: "Grade 4",
        dateOfBirth: "Jan 12, 2016",
        status: "Active",
        diagnoses: ["Autism Spectrum", "Sensory processing"],
        primaryGuardian: {
            name: "Morgan Chen",
            email: "morgan.chen@example.com",
            phone: "(555) 213-9110",
        },
        assignedTeacher: "Jo Walsh",
        lastUpdated: "Apr 2, 2025",
        notes: "Responds well to visual schedules and weekly communication logs.",
    },
    {
        id: 2,
        name: "Noah Alvarez",
        grade: "Grade 3",
        dateOfBirth: "May 8, 2017",
        status: "Onboarding",
        diagnoses: ["ADHD"],
        primaryGuardian: {
            name: "Samara Alvarez",
            email: "samara.alvarez@example.com",
            phone: "(555) 402-1188",
        },
        assignedTeacher: "Ellie Summers",
        lastUpdated: "Mar 28, 2025",
        notes: "Scheduled for first evaluation on Apr 9. Guardian requested weekly progress check-ins.",
    },
    {
        id: 3,
        name: "Lina Patel",
        grade: "Grade 5",
        dateOfBirth: "Sep 30, 2015",
        status: "Active",
        diagnoses: ["Dyslexia"],
        primaryGuardian: {
            name: "Ravi Patel",
            email: "ravi.patel@example.com",
            phone: "(555) 899-2441",
        },
        assignedTeacher: "Jordan Rivers",
        lastUpdated: "Mar 22, 2025",
        notes: "Currently working through literacy intervention track with weekly parent summaries.",
    },
];

const gradeOptions = ["All grades", "Grade 3", "Grade 4", "Grade 5"];
const statusOptions: Array<"All statuses" | "Active" | "Onboarding" | "Archived"> = [
    "All statuses",
    "Active",
    "Onboarding",
    "Archived",
];
const teacherOptions = ["All teachers", "Jo Walsh", "Ellie Summers", "Jordan Rivers"];

const statusTone: Record<string, "default" | "secondary" | "outline"> = {
    active: "default",
    onboarding: "secondary",
    archived: "outline",
};

export default function Students() {
    const [search, setSearch] = useState("");
    const [grade, setGrade] = useState(gradeOptions[0]);
    const [status, setStatus] = useState<typeof statusOptions[number]>("All statuses");
    const [teacher, setTeacher] = useState(teacherOptions[0]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 3;

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                search.trim().length === 0 ||
                [
                    student.name,
                    student.primaryGuardian.name,
                    student.primaryGuardian.email,
                    student.assignedTeacher,
                    ...student.diagnoses,
                ].some((value) => value.toLowerCase().includes(search.toLowerCase()));

            const matchesGrade = grade === gradeOptions[0] || student.grade === grade;
            const matchesStatus = status === "All statuses" || student.status.toLowerCase() === status.toLowerCase();
            const matchesTeacher = teacher === teacherOptions[0] || student.assignedTeacher === teacher;

            return matchesSearch && matchesGrade && matchesStatus && matchesTeacher;
        });
    }, [grade, status, teacher, search]);

    useEffect(() => {
        setPage(1);
    }, [search, grade, status, teacher]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, currentPage]);

    const handleChangePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) {
            return;
        }
        setPage(nextPage);
    };

    const activeFilters = [
        grade !== gradeOptions[0] && {label: grade, onRemove: () => setGrade(gradeOptions[0])},
        status !== "All statuses" && {label: status, onRemove: () => setStatus("All statuses")},
        teacher !== teacherOptions[0] && {label: teacher, onRemove: () => setTeacher(teacherOptions[0])},
    ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

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
                                    placeholder="Search by student or guardian…"
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearch("");
                                    setGrade(gradeOptions[0]);
                                    setStatus("All statuses");
                                    setTeacher(teacherOptions[0]);
                                    setFiltersOpen(false);
                                }}
                            >
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
                                    <Select
                                        value={status}
                                        onValueChange={(value: "All statuses" | "Active" | "Onboarding" | "Archived") => setStatus(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Assigned teacher</p>
                                    <Select value={teacher} onValueChange={(value) => setTeacher(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teacherOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setGrade(gradeOptions[0]);
                                            setStatus("All statuses");
                                            setTeacher(teacherOptions[0]);
                                            setFiltersOpen(false);
                                        }}
                                    >
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

            <div className="space-y-6">
                {paginatedStudents.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-4">
                            {paginatedStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-semibold text-foreground">{student.name}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <Badge variant="outline">{student.grade}</Badge>
                                                <span>DOB · {student.dateOfBirth}</span>
                                                <span>Teacher · {student.assignedTeacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusTone[student.status.toLowerCase()] ?? "outline"}>
                                                {student.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">Updated {student.lastUpdated}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Diagnoses & supports
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {student.diagnoses.map((diagnosis) => (
                                                    <Badge key={diagnosis} variant="secondary">
                                                        {diagnosis}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{student.notes}</p>
                                        </div>
                                        <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary guardian</h4>
                                            <p className="text-sm font-medium text-foreground">{student.primaryGuardian.name}</p>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <span>{student.primaryGuardian.email}</span>
                                                <span>{student.primaryGuardian.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button asChild variant="link" size="sm" className="px-0 text-primary">
                                            <Link to={`/students/${student.id}`}>Open profile</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/students/${student.id}?tab=notes`}>Add note</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/students/${student.id}?tab=documents`}>Upload evidence</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleChangePage(currentPage - 1);
                                        }} size={"default"}                                    />
                                </PaginationItem>
                                {Array.from({length: totalPages}).map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                href="#"
                                                isActive={pageNumber === currentPage}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    handleChangePage(pageNumber);
                                                }} size={"default"}                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleChangePage(currentPage + 1);
                                        }} size={"default"}                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                ) : (
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
                )}
            </div>
        </div>
    );
}
