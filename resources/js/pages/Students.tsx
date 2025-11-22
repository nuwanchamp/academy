import {useEffect, useState} from "react";
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
import {useStudents} from "@/features/students/hooks/useStudents.ts";

import type {StudentListItem} from "@/features/students/types/student";
import {LoadingCard} from "@/features/students/components/LoadingCard.tsx";
import {ErrorCard} from "@/features/students/components/ErrorCard.tsx";
import {EmptyStateCard} from "@/features/students/components/EmptyStateCard.tsx";
import {StudentCard} from "@/features/students/components/StudentCard.tsx";
import {StudentPagination} from "@/features/students/components/StudentPagination.tsx";

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
    const {
        students,
        gradeOptions,
        search,
        setSearch,
        grade,
        setGrade,
        status,
        setStatus,
        page,
        setPage,
        isLoading,
        error,
        meta,
        resetFilters,
        DEFAULT_GRADE_FILTER,
        DEFAULT_STATUS_FILTER,
        STATUS_OPTIONS,
        load,
    } = useStudents();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleChangePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > meta.last_page) {
            return;
        }
        setPage(nextPage);
    };

    const activeFilters = [
        grade !== DEFAULT_GRADE_FILTER && {label: grade, onRemove: () => setGrade(DEFAULT_GRADE_FILTER)},
        status !== DEFAULT_STATUS_FILTER && {
            label: STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Status",
            onRemove: () => setStatus(DEFAULT_STATUS_FILTER),
        },
    ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

    const rosterContent = () => {
        if (isLoading) {
            return <LoadingCard title="Loading your caseload…" description="Fetching students from the server." />;
        }

        if (error) {
            return <ErrorCard title="Unable to load students" message={error} onRetry={() => load()} />;
        }

        if (students.length === 0) {
            return (
                <EmptyStateCard
                    title="No students match your filters yet"
                    description="Adjust your filters or register a new student to see them listed here."
                    cta={{label: "Register student", to: "/students/create"}}
                />
            );
        }

        return (
            <>
                <div className="flex flex-col gap-4">
                    {students.map((student) => (
                        <StudentCard key={student.id} student={student} statusTone={statusTone} formatDate={formatDate} />
                    ))}
                </div>

                <StudentPagination meta={meta} onChangePage={handleChangePage} />
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
                                            {STATUS_OPTIONS.map((option) => (
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
