import {useCallback, useEffect, useState} from "react";
import type {StudentListItem} from "../types/student";
import {fetchStudents} from "../services/studentApi";
import {DEFAULT_GRADE_FILTER, DEFAULT_STATUS_FILTER, PAGE_SIZE, STATUS_OPTIONS} from "../constants";
import {useStudentFiltersStore} from "../store/useStudentFiltersStore";
import axios from "axios";

export function useStudents() {
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [gradeOptions, setGradeOptions] = useState<string[]>([DEFAULT_GRADE_FILTER]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const {search, grade, status, page, setSearch, setGrade, setStatus, setPage, reset} = useStudentFiltersStore();

    const load = useCallback(async (overridePage?: number) => {
        const currentPage = overridePage ?? page;
        setIsLoading(true);
        try {
            const data = await fetchStudents({
                page: currentPage,
                per_page: PAGE_SIZE,
                search,
                grade: grade !== DEFAULT_GRADE_FILTER ? grade : undefined,
                status: status !== DEFAULT_STATUS_FILTER ? status : undefined,
            });
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
            const message = axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : "Unable to load students.";
            setError(message);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    }, [grade, status, search, page]);

    useEffect(() => {
        setPage(1);
    }, [search, grade, status, setPage]);

    useEffect(() => {
        load();
    }, [page, load]);

    const resetFilters = () => {
        // Let the dependent effects refetch after the store updates so we avoid using stale filters
        reset();
    };

    return {
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
        load,
        resetFilters,
        DEFAULT_GRADE_FILTER,
        DEFAULT_STATUS_FILTER,
        STATUS_OPTIONS,
    };
}
