import {useCallback, useEffect, useMemo, useState} from "react";
import type {PathFilters, PathStatus, PathSummary} from "../types/path";
import {listPaths} from "../services/pathApi";

const DEFAULT_SUBJECT = "All subjects";
const DEFAULT_GRADE = "All grade bands";
const DEFAULT_STATUS = "all";
const PAGE_SIZE = 6;

export function usePaths() {
    const [paths, setPaths] = useState<PathSummary[]>([]);
    const [filters, setFilters] = useState<PathFilters>({
        subjects: [],
        grade_bands: [],
        statuses: [],
        visibilities: [],
    });
    const [meta, setMeta] = useState<Record<string, any>>({current_page: 1, last_page: 1, total: 0});

    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState<string>(DEFAULT_SUBJECT);
    const [gradeBand, setGradeBand] = useState<string>(DEFAULT_GRADE);
    const [status, setStatus] = useState<"all" | PathStatus>(DEFAULT_STATUS);
    const [page, setPage] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const {data, filters: remoteFilters, meta: remoteMeta} = await listPaths({
                search: search || undefined,
                subject: subject !== DEFAULT_SUBJECT ? subject : undefined,
                grade_band: gradeBand !== DEFAULT_GRADE ? gradeBand : undefined,
                status: status !== "all" ? status : undefined,
                page,
                per_page: PAGE_SIZE,
            });
            setPaths(data ?? []);
            setFilters(remoteFilters);
            setMeta(remoteMeta ?? {current_page: 1, last_page: 1, total: data?.length ?? 0});
            setError(null);
        } catch (err) {
            setError("Unable to load paths right now. Please try again.");
            setPaths([]);
        } finally {
            setIsLoading(false);
        }
    }, [gradeBand, page, search, status, subject]);

    useEffect(() => {
        setPage(1);
    }, [search, subject, gradeBand, status]);

    useEffect(() => {
        load();
    }, [load]);

    const subjectOptions = useMemo(
        () => [DEFAULT_SUBJECT, ...filters.subjects],
        [filters.subjects],
    );

    const gradeOptions = useMemo(
        () => [DEFAULT_GRADE, ...filters.grade_bands],
        [filters.grade_bands],
    );

    const statusOptions: Array<"all" | PathStatus> = useMemo(
        () => ["all", ...(filters.statuses as PathStatus[])],
        [filters.statuses],
    );

    const resetFilters = () => {
        setSearch("");
        setSubject(DEFAULT_SUBJECT);
        setGradeBand(DEFAULT_GRADE);
        setStatus(DEFAULT_STATUS);
    };

    return {
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
    };
}
