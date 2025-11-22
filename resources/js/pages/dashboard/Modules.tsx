import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {Filter, Search} from "lucide-react";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
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
import {useModules} from "@/features/modules/hooks/useModules.ts";

type ModuleStatus = "published" | "draft" | "archived";

const statusTone: Record<ModuleStatus, "default" | "secondary" | "outline"> = {
    published: "default",
    draft: "secondary",
    archived: "outline",
};

export default function Modules() {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const {
        modules,
        search,
        setSearch,
        subject,
        setSubject,
        subjectOptions,
        gradeBand,
        setGradeBand,
        gradeBandOptions,
        status,
        setStatus,
        statusOptions,
        page,
        setPage,
        meta,
        isLoading,
        error,
        resetFilters,
    } = useModules();

    const paginatedModules = useMemo(() => modules, [modules]);

    const handlePageChange = (nextPage: number) => {
        if (!meta?.last_page) {
            return;
        }
        if (nextPage < 1 || nextPage > meta.last_page) {
            return;
        }
        setPage(nextPage);
    };

    const displayStatus = (value?: string | null): ModuleStatus => {
        const normalized = (value ?? "draft").toLowerCase();
        if (normalized === "published" || normalized === "archived") {
            return normalized;
        }
        return "draft";
    };

    const updatedLabel = (value?: string | null) => {
        if (!value) {
            return "—";
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        return new Intl.DateTimeFormat(undefined, {month: "short", day: "numeric", year: "numeric"}).format(parsed);
    };

    const emptyState = !isLoading && !error && paginatedModules.length === 0;

    return (
        <div className="space-y-8 text-primary">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeading lead="Curriculum" title="Module Library" />
                <Button asChild size="lg">
                    <Link to="/modules/create">Create module</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>All modules</CardTitle>
                        <CardDescription>
                            Browse modules by subject, grade band, and publication status.
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
                                    placeholder="Search by module…"
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
                            <PopoverContent align="end" className="w-80 space-y-4 p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Subject</p>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjectOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Grade band</p>
                                    <Select value={gradeBand} onValueChange={setGradeBand}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade band" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeBandOptions.map((option) => (
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
                                                <SelectItem key={option} value={option}>
                                                    {option}
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
                </CardContent>
            </Card>
            {isLoading && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Loading modules…
                    </CardContent>
                </Card>
            )}
            {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="py-6 text-destructive">
                        <div className="flex items-center justify-between">
                            <p>Unable to load modules: {error}</p>
                            <Button variant="outline" onClick={() => resetFilters()}>
                                Reset filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            {emptyState && (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        No modules match your filters yet.
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedModules.map((module) => {
                    const normalizedStatus = displayStatus(module.status);
                    const statusVariant = statusTone[normalizedStatus] ?? "outline";

                    return (
                        <Card key={module.id} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Badge variant={statusVariant} className="uppercase">
                                        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{updatedLabel(module.updated_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                        {module.code}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {module.subject ?? "Subject TBD"} · {module.grade_band ?? "Grade TBD"}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col justify-between gap-3">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {module.summary}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {(module.tags ?? []).slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <div className="flex w-full items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        <strong className="font-semibold text-foreground">{module.lessons_count ?? 0}</strong> lessons
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/modules/${module.id}`} className="flex items-center gap-2">
                                            View overview
                                        </Link>
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 9 + 1}-{Math.min(page * 9, meta?.total ?? modules.length)} of {meta?.total ?? modules.length} modules
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(page - 1)}
                                className={cn(page === 1 && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                        {Array.from({length: meta?.last_page ?? 1}, (_, index) => index + 1).map((pageNumber) => (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    isActive={pageNumber === page}
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(page + 1)}
                                className={cn(page === (meta?.last_page ?? 1) && "pointer-events-none opacity-50")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
