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

type ModuleStatus = "Published" | "Draft" | "Archived";

interface Module {
    id: string;
    code: string;
    title: string;
    summary: string;
    subject: string;
    gradeBand: string;
    duration: string;
    status: ModuleStatus;
    lessons: number;
    updated: string;
    tags: string[];
}

const modules: Module[] = [
    {
        id: "mod-sense-001",
        code: "MOD-EXPLR-001",
        title: "Sensory Exploration Foundations",
        summary: "Build shared language around the five senses and introduce calming techniques learners can practise independently.",
        subject: "Wellness",
        gradeBand: "Grades K – 2",
        duration: "2 weeks",
        status: "Published",
        lessons: 8,
        updated: "Mar 14, 2024",
        tags: ["sensory", "mindfulness", "routines"],
    },
    {
        id: "mod-comm-004",
        code: "MOD-COMM-004",
        title: "Everyday Communication Circles",
        summary: "Storytelling prompts and circle time rituals that strengthen expressive language and listening stamina.",
        subject: "Literacy",
        gradeBand: "Grades 3 – 5",
        duration: "3 weeks",
        status: "Draft",
        lessons: 12,
        updated: "Mar 08, 2024",
        tags: ["discussion", "community building", "language"],
    },
    {
        id: "mod-move-002",
        code: "MOD-MOVE-002",
        title: "Movement & Mindfulness",
        summary: "Daily movement flows paired with reflective prompts to help learners notice changes in energy and mood.",
        subject: "Wellness",
        gradeBand: "Grades 3 – 5",
        duration: "4 weeks",
        status: "Published",
        lessons: 16,
        updated: "Mar 02, 2024",
        tags: ["SEL", "movement", "reflection"],
    },
    {
        id: "mod-stem-003",
        code: "MOD-STEM-003",
        title: "Curiosity Makers: Simple Machines",
        summary: "Design studio stations where learners prototype simple machines and document their iterations.",
        subject: "Science",
        gradeBand: "Grades 4 – 6",
        duration: "3 weeks",
        status: "Published",
        lessons: 10,
        updated: "Feb 26, 2024",
        tags: ["STEM", "project-based", "design"],
    },
    {
        id: "mod-literacy-006",
        code: "MOD-LIT-006",
        title: "Author Study Lab",
        summary: "Dive into author craft moves with mentor texts, annotation clubs, and publishing celebrations.",
        subject: "Literacy",
        gradeBand: "Grades 6 – 8",
        duration: "5 weeks",
        status: "Draft",
        lessons: 18,
        updated: "Feb 21, 2024",
        tags: ["reading", "writing", "workshop"],
    },
    {
        id: "mod-math-210",
        code: "MOD-MATH-210",
        title: "Proportional Reasoning Playlist",
        summary: "Choice-driven playlists and mini-seminars that prepare learners for algebra readiness.",
        subject: "Mathematics",
        gradeBand: "Grades 7 – 8",
        duration: "4 weeks",
        status: "Published",
        lessons: 14,
        updated: "Feb 12, 2024",
        tags: ["math workshop", "playlists", "algebra"],
    },
    {
        id: "mod-archive-101",
        code: "MOD-ARTS-101",
        title: "Community Murals Project",
        summary: "Collaborative mural project blending art techniques with local storytelling and public showcases.",
        subject: "Arts",
        gradeBand: "Grades 5 – 8",
        duration: "6 weeks",
        status: "Archived",
        lessons: 20,
        updated: "Jan 30, 2024",
        tags: ["arts integration", "community", "project-based"],
    },
    {
        id: "mod-sci-042",
        code: "MOD-SCI-042",
        title: "Weather Inquiry Lab",
        summary: "Field observations, data collection, and storytelling to make sense of weather patterns.",
        subject: "Science",
        gradeBand: "Grades 3 – 5",
        duration: "3 weeks",
        status: "Published",
        lessons: 11,
        updated: "Jan 18, 2024",
        tags: ["inquiry", "data literacy", "science"],
    },
    {
        id: "mod-literacy-031",
        code: "MOD-LIT-031",
        title: "Podcasting for Perspective",
        summary: "Learners plan, script, and produce podcasts focused on local change makers.",
        subject: "Humanities",
        gradeBand: "Grades 8 – 10",
        duration: "4 weeks",
        status: "Draft",
        lessons: 15,
        updated: "Jan 11, 2024",
        tags: ["media literacy", "voice", "project"],
    },
];

const subjectOptions = ["All subjects", "Wellness", "Literacy", "Science", "Mathematics", "Arts", "Humanities"];
const gradeOptions = ["All grade bands", "Grades K – 2", "Grades 3 – 5", "Grades 4 – 6", "Grades 5 – 8", "Grades 6 – 8", "Grades 7 – 8", "Grades 8 – 10"];
const statusOptions: Array<"All statuses" | ModuleStatus> = ["All statuses", "Published", "Draft", "Archived"];

const statusTone: Record<ModuleStatus, "default" | "secondary" | "outline"> = {
    Published: "default",
    Draft: "secondary",
    Archived: "outline",
};

export default function Modules() {
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState(subjectOptions[0]);
    const [gradeBand, setGradeBand] = useState(gradeOptions[0]);
    const [status, setStatus] = useState<"All statuses" | ModuleStatus>("All statuses");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const pageSize = 6;

    useEffect(() => {
        setPage(1);
    }, [search, subject, gradeBand, status]);

    const filteredModules = useMemo(() => {
        return modules.filter((module) => {
            const matchesSearch = search.trim().length === 0
                || [module.title, module.summary, module.code, ...module.tags].some((value) =>
                    value.toLowerCase().includes(search.toLowerCase()),
                );
            const matchesSubject = subject === subjectOptions[0] || module.subject === subject;
            const matchesGradeBand = gradeBand === gradeOptions[0] || module.gradeBand === gradeBand;
            const matchesStatus = status === "All statuses" || module.status === status;
            return matchesSearch && matchesSubject && matchesGradeBand && matchesStatus;
        });
    }, [search, subject, gradeBand, status]);

    const totalPages = Math.max(1, Math.ceil(filteredModules.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedModules = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredModules.slice(start, start + pageSize);
    }, [filteredModules, currentPage]);

    const handleChangePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) {
            return;
        }
        setPage(nextPage);
    };

    const activeFilters = [
        subject !== subjectOptions[0] && {label: subject, onRemove: () => setSubject(subjectOptions[0])},
        gradeBand !== gradeOptions[0] && {label: gradeBand, onRemove: () => setGradeBand(gradeOptions[0])},
        status !== "All statuses" && {label: status, onRemove: () => setStatus("All statuses")},
    ].filter(Boolean) as Array<{label: string; onRemove: () => void}>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeading lead="Plan" title="Modules Library"/>
                <Button asChild size="lg">
                    <Link to="/modules/create">Create module</Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Curated modules to jumpstart planning</CardTitle>
                        <CardDescription>
                            Search, filter, and assign modular learning experiences tailored to your community.
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
                                    placeholder="Search by title, code, or tag…"
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSearch("");
                                    setSubject(subjectOptions[0]);
                                    setGradeBand(gradeOptions[0]);
                                    setStatus("All statuses");
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
                                    <Select value={status} onValueChange={(value: "All statuses" | ModuleStatus) => setStatus(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status"/>
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSubject(subjectOptions[0]);
                                            setGradeBand(gradeOptions[0]);
                                            setStatus("All statuses");
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
                {paginatedModules.length > 0 ? (
                    <>
                        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                            {paginatedModules.map((module) => (
                                <Card key={module.id} className="relative overflow-hidden border border-border/60 bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <CardContent className="flex h-full flex-col gap-5 p-6">
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            <Badge variant="outline">{module.code}</Badge>
                                            <Badge variant="outline">{module.subject}</Badge>
                                            <Badge variant="outline">{module.gradeBand}</Badge>
                                            <Badge variant={statusTone[module.status]}>{module.status}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl text-foreground">{module.title}</CardTitle>
                                            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                                {module.summary}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {module.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="uppercase tracking-wide">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex flex-col gap-4">
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span>{module.duration}</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground"/>
                                                <span>{module.lessons} lessons</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground"/>
                                                <span>Updated {module.updated}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <Button asChild size="sm">
                                                    <Link to={`/modules/${module.id}`}>View module</Link>
                                                </Button>
                                                <Button variant="outline" size="sm" disabled={module.status !== "Published"}>
                                                    Assign
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
                            <CardTitle className="text-lg text-foreground">No modules match your filters yet</CardTitle>
                            <p className="max-w-md text-sm leading-relaxed">
                                Adjust your filters or build a fresh module tailored to your next unit.
                            </p>
                            <Button asChild>
                                <Link to="/modules/create">Design a new module</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
