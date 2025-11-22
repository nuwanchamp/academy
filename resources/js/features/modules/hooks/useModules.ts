import {useCallback, useEffect, useMemo, useState} from "react";
import {fetchModules} from "../services/moduleApi";
import type {ModuleSummary, PaginatedResponse} from "../types/module";

const DEFAULT_SUBJECT = "All subjects";
const DEFAULT_GRADE = "All grade bands";
const DEFAULT_STATUS = "All statuses";
const PAGE_SIZE = 9;

export function useModules() {
    const [modules, setModules] = useState<ModuleSummary[]>([]);
    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState(DEFAULT_SUBJECT);
    const [gradeBand, setGradeBand] = useState(DEFAULT_GRADE);
    const [status, setStatus] = useState(DEFAULT_STATUS);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginatedResponse<ModuleSummary>["meta"]>({current_page: 1, last_page: 1, total: 0});
    const [filters, setFilters] = useState<NonNullable<PaginatedResponse<ModuleSummary>["filters"]>>({
        subjects: [],
        grade_bands: [],
        statuses: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchModules({
                page,
                per_page: PAGE_SIZE,
                search: search.trim() || undefined,
                subject: subject !== DEFAULT_SUBJECT ? subject : undefined,
                grade_band: gradeBand !== DEFAULT_GRADE ? gradeBand : undefined,
                status: status !== DEFAULT_STATUS ? status.toLowerCase() : undefined,
            });
            setModules(response.data);
            setMeta(response.meta ?? {current_page: 1, last_page: 1, total: response.data.length});
            setFilters(response.filters ?? {subjects: [], grade_bands: [], statuses: []});
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load modules.");
            setModules([]);
        } finally {
            setIsLoading(false);
        }
    }, [gradeBand, page, search, status, subject]);

    useEffect(() => {
        setPage(1);
    }, [search, subject, gradeBand, status]);

    useEffect(() => {
        load().then(() => {});
    }, [load]);

    const subjectOptions = useMemo(() => [DEFAULT_SUBJECT, ...(filters.subjects ?? [])], [filters.subjects]);
    const gradeBandOptions = useMemo(() => [DEFAULT_GRADE, ...(filters.grade_bands ?? [])], [filters.grade_bands]);
    const statusOptions = useMemo(() => [DEFAULT_STATUS, ...(filters.statuses ?? [])], [filters.statuses]);

    const resetFilters = () => {
        setSearch("");
        setSubject(DEFAULT_SUBJECT);
        setGradeBand(DEFAULT_GRADE);
        setStatus(DEFAULT_STATUS);
    };

    return {
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
        load,
    };
}
