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

type PathStatus = "Active" | "Draft" | "Archived";

interface LearningPath {
    id: string;
    title: string;
    summary: string;
    subject: string;
    gradeBand: string;
    pacing: string;
    status: PathStatus;
    students: number;
    lastUpdated: string;
    tags: string[];
}

const allPaths: LearningPath[] = [
    {
        id: "multiplication-mastery",
        title: "Multiplication Mastery Roadmap",
        summary: "A joyful six-week journey grounded in math discourse, tactile tools, and collaborative problem solving.",
        subject: "Mathematics",
        gradeBand: "Grades 3 – 5",
        pacing: "6 weeks",
        status: "Active",
        students: 128,
        lastUpdated: "Mar 15, 2024",
        tags: ["fluency", "math talk", "strategies"],
    },
    {
        id: "literary-voices",
        title: "Literary Voices Studio",
        summary: "Amplify author craft moves while nurturing discussion rituals and publishing moments for every writer.",
        subject: "Literacy",
        gradeBand: "Grades 6 – 8",
        pacing: "8 weeks",
        status: "Draft",
        students: 84,
        lastUpdated: "Mar 11, 2024",
        tags: ["writer's workshop", "publishing", "discussion"],
    },
    {
        id: "mindful-movement",
        title: "Mindful Movement Collective",
        summary: "Blend SEL check-ins, movement labs, and community circles to build regulation superpowers.",
        subject: "Wellness",
        gradeBand: "Grades K – 2",
        pacing: "4 weeks",
        status: "Active",
        students: 96,
        lastUpdated: "Mar 05, 2024",
        tags: ["SEL", "mindfulness", "movement"],
    },
    {
        id: "curiosity-labs",
        title: "Curiosity Labs: Forces & Motion",
        summary: "Inquiry-rich stations that pair wonder questions with quick capture evidence protocols.",
        subject: "Science",
        gradeBand: "Grades 3 – 5",
        pacing: "5 weeks",
        status: "Active",
        students: 142,
        lastUpdated: "Feb 29, 2024",
        tags: ["STEM", "project-based", "hands-on"],
    },
    {
        id: "community-storytelling",
        title: "Community Storytelling Project",
        summary: "Students document local histories through interviews, archives, and multimedia storytelling.",
        subject: "Humanities",
        gradeBand: "Grades 6 – 8",
        pacing: "6 weeks",
        status: "Draft",
        students: 65,
        lastUpdated: "Feb 21, 2024",
        tags: ["project-based", "oral history", "media"],
    },
    {
        id: "algebra-bridge",
        title: "Algebra Bridge Builders",
        summary: "Strengthen proportional reasoning and equation fluency with real-world design challenges.",
        subject: "Mathematics",
        gradeBand: "Grades 8 – 9",
        pacing: "7 weeks",
        status: "Active",
        students: 110,
        lastUpdated: "Feb 18, 2024",
        tags: ["readiness", "algebra", "design thinking"],
    },
    {
        id: "eco-innovators",
        title: "Eco Innovators Studio",
        summary: "Learners prototype sustainability solutions for their campus leveraging design sprints.",
        subject: "Science",
        gradeBand: "Grades 6 – 8",
        pacing: "5 weeks",
        status: "Archived",
        students: 78,
        lastUpdated: "Jan 30, 2024",
        tags: ["design thinking", "environment", "STEM"],
    },
    {
        id: "numeracy-playlab",
        title: "Numeracy Play Lab",
        summary: "Purposeful play provocations that grow numeracy and storytelling in early childhood classrooms.",
        subject: "Mathematics",
        gradeBand: "Grades K – 2",
        pacing: "4 weeks",
        status: "Active",
        students: 102,
        lastUpdated: "Jan 26, 2024",
        tags: ["play-based", "early numeracy", "centers"],
    },
    {
        id: "digital-civics",
        title: "Digital Civics Expedition",
        summary: "Critical media literacy meets civic action through co-created campaigns and authentic audiences.",
        subject: "Humanities",
        gradeBand: "Grades 9 – 12",
        pacing: "6 weeks",
        status: "Draft",
        students: 54,
        lastUpdated: "Jan 12, 2024",
        tags: ["media literacy", "civic action", "collaboration"],
    },
];

const subjectOptions = ["All subjects", "Mathematics", "Science", "Literacy", "Humanities", "Wellness"];
const gradeOptions = ["All grade bands", "Grades K – 2", "Grades 3 – 5", "Grades 6 – 8", "Grades 8 – 9", "Grades 9 – 12"];
const statusOptions: Array<"All statuses" | PathStatus> = ["All statuses", "Active", "Draft", "Archived"];

const statusTone: Record<PathStatus, "default" | "secondary" | "outline"> = {
    Active: "default",
    Draft: "secondary",
    Archived: "outline",
};

export default function LearningPaths() {
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState(subjectOptions[0]);
    const [gradeBand, setGradeBand] = useState(gradeOptions[0]);
    const [status, setStatus] = useState<"All statuses" | PathStatus>("All statuses");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const pageSize = 6;

    useEffect(() => {
        setPage(1);
    }, [search, subject, gradeBand, status]);

    const filteredPaths = useMemo(() => {
        return allPaths.filter((path) => {
            const matchesSearch = search.trim().length === 0
                || [path.title, path.summary, ...path.tags].some((value) =>
                    value.toLowerCase().includes(search.toLowerCase()),
                );
            const matchesSubject = subject === subjectOptions[0] || path.subject === subject;
            const matchesGradeBand = gradeBand === gradeOptions[0] || path.gradeBand === gradeBand;
            const matchesStatus = status === "All statuses" || path.status === status;
            return matchesSearch && matchesSubject && matchesGradeBand && matchesStatus;
        });
    }, [search, subject, gradeBand, status]);

    const totalPages = Math.max(1, Math.ceil(filteredPaths.length / pageSize));
    const currentPage = Math.min(page, totalPages);

    const paginatedPaths = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPaths.slice(start, start + pageSize);
    }, [filteredPaths, currentPage]);

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
                                    <Select value={status} onValueChange={(value: "All statuses" | PathStatus) => setStatus(value)}>
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
                {paginatedPaths.length > 0 ? (
                    <>
                        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                            {paginatedPaths.map((path) => (
                                <Card key={path.id} className="relative overflow-hidden border border-border/60 bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <CardContent className="flex h-full flex-col gap-5 p-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{path.subject}</Badge>
                                            <Badge variant="outline">{path.gradeBand}</Badge>
                                            <Badge variant={statusTone[path.status]}>{path.status}</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-xl text-foreground">{path.title}</CardTitle>
                                            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                                {path.summary}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {path.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="uppercase tracking-wide">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex flex-col gap-4">
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span>{path.pacing}</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground"/>
                                                <span>{path.students} learners enrolled</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground"/>
                                                <span>Updated {path.lastUpdated}</span>
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
