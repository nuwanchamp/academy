import {create} from "zustand";
import {DEFAULT_GRADE_FILTER, DEFAULT_STATUS_FILTER} from "../constants";

type FiltersState = {
    search: string;
    grade: string;
    status: string;
    page: number;
    setSearch: (val: string) => void;
    setGrade: (val: string) => void;
    setStatus: (val: string) => void;
    setPage: (val: number) => void;
    reset: () => void;
};

export const useStudentFiltersStore = create<FiltersState>((set) => ({
    search: "",
    grade: DEFAULT_GRADE_FILTER,
    status: DEFAULT_STATUS_FILTER,
    page: 1,
    setSearch: (search) => set({search, page: 1}),
    setGrade: (grade) => set({grade, page: 1}),
    setStatus: (status) => set({status, page: 1}),
    setPage: (page) => set({page}),
    reset: () => set({search: "", grade: DEFAULT_GRADE_FILTER, status: DEFAULT_STATUS_FILTER, page: 1}),
}));
