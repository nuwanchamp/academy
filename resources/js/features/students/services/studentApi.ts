import api from "@/lib/api_client";
import type {PaginatedResponse, StudentListItem} from "../types/student";
import {studentListResponseSchema} from "../schema/studentSchema";
import {PAGE_SIZE} from "../constants";

export async function fetchStudents(params: {page?: number; per_page?: number; search?: string; grade?: string; status?: string}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    searchParams.set("per_page", String(params.per_page ?? PAGE_SIZE));
    if (params.search) searchParams.set("search", params.search.trim());
    if (params.grade) searchParams.set("grade", params.grade);
    if (params.status) searchParams.set("status", params.status);
    const {data}: {data: PaginatedResponse<StudentListItem>} = await api.get(`/students?${searchParams.toString()}`);
    const parsed = studentListResponseSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Malformed student list response");
    }
    return parsed.data;
}
