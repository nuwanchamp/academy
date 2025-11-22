import {useState} from "react";
import {Link} from "react-router-dom";
import {Filter, Loader2, Search} from "lucide-react";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
import {usePaths} from "@/features/paths/hooks/usePaths.ts";
import type {PathStatus} from "@/features/paths/types/path.ts";

const formatStatus = (status: string | null | undefined): string => {
    if (!status) return "Draft";
    if (status === "published") return "Published";
    if (status === "archived") return "Archived";
    return "Draft";
};

const statusTone: Record<PathStatus, "default" | "secondary" | "outline"> = {
    published: "default",
    draft: "secondary",
    archived: "outline",
};

export default function LearningPaths() {
    const {
        paths,
        filters,
        meta,
        search,
        setSearch,
        subject,
        setSubject,
        subjectOptions,
        gradeBand,
        setGradeBand,
        gradeOptions,
        status,
        setStatus,
        statusOptions,
        page,
        setPage,
        isLoading,
        error,
        resetFilters,
    } = usePaths();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const totalPages = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? page;

    const handleChangePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) {
            return;
        }
        setPage(nextPage);
    };

    const activeFilters = [
        subject !== "All subjects" && {label: subject, onRemove: () => setSubject("All subjects")},
        gradeBand !== "All grade bands" && {label: gradeBand, onRemove: () => setGradeBand("All grade bands")},
        status !== "all" && {label: formatStatus(status), onRemove: () => setStatus("all")},
    ].filter(Boolean) as Array<{label: string; onRemove: () => void}>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeading lead="Explore" title="Learning Paths"/>
                <Button asChild size="lg">
                    <Link to="/paths/create">Create new path</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Find the right pathway</CardTitle>
                        <CardDescription>
                            Search and filter through curated learning pathways to assign or customise for your learners.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by title, keyword, or tag…"
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    resetFilters();
                                    setFiltersOpen(false);
                                }}
                                className="md:w-auto"
                            >
                                Reset
                            </Button>
                        </div>
                        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-center gap-2 lg:w-auto">
                                    <Filter className="size-4"/>
                                    Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-72 space-y-4 p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">Subject</p>
                                    <Select value={subject} onValueChange={(value) => setSubject(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Subject"/>
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
                                    <Select value={gradeBand} onValueChange={(value) => setGradeBand(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Grade band"/>
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
                                    <Select value={status} onValueChange={(value: "all" | PathStatus) => setStatus(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option === "all" ? "All statuses" : formatStatus(option)}
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
                                            resetFilters();
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
                {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin"/>
                        <span>Loading paths…</span>
                    </div>
                ) : error ? (
                    <Card className="border-destructive/30">
                        <CardContent className="py-8 text-center text-sm text-destructive">
                            {error}
                        </CardContent>
                    </Card>
                ) : paths.length > 0 ? (
                    <>
                        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                            {paths.map((path) => (
                                <Card key={path.id} className="relative overflow-hidden border border-border/60 bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <CardContent className="flex h-full flex-col gap-5 p-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {path.subject && <Badge variant="outline">{path.subject}</Badge>}
                                            {path.grade_band && <Badge variant="outline">{path.grade_band}</Badge>}
                                            <Badge variant={statusTone[path.status] ?? "secondary"}>{formatStatus(path.status)}</Badge>
                                            <Badge variant="secondary">{path.modules_count} modules</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl text-foreground">{path.title}</CardTitle>
                                            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                                {path.summary || "No summary provided yet."}
                                            </CardDescription>
                                        </div>
                                        <div className="mt-auto flex flex-col gap-4">
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span>{path.pacing || "Pacing TBD"}</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground"/>
                                                <span>Updated {path.updated_at ? new Date(path.updated_at).toLocaleDateString() : "recently"}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <Button asChild size="sm">
                                                    <Link to={`/paths/${path.id}`}>View path</Link>
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    Plan assignment
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                        }}
                                    />
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
                                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            handleChangePage(currentPage + 1);
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                            <CardTitle className="text-lg text-foreground">No paths match your filters just yet</CardTitle>
                            <p className="max-w-md text-sm leading-relaxed">
                                Try adjusting the filters or create a brand new learning path tailored to your community.
                            </p>
                            <Button asChild>
                                <Link to="/paths/create">Design a new path</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
