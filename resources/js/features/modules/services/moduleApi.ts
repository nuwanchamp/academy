import api from "@/lib/api_client";
import type {ModuleDetail, ModuleSummary, PaginatedResponse} from "../types/module";

type ListParams = {
    page?: number;
    per_page?: number;
    search?: string;
    subject?: string;
    grade_band?: string;
    status?: string;
};

export async function fetchModules(params: ListParams = {}): Promise<PaginatedResponse<ModuleSummary>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.per_page) searchParams.set("per_page", String(params.per_page));
    if (params.search) searchParams.set("search", params.search.trim());
    if (params.subject) searchParams.set("subject", params.subject);
    if (params.grade_band) searchParams.set("grade_band", params.grade_band);
    if (params.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    const {data} = await api.get<PaginatedResponse<ModuleSummary>>(`/modules${query ? `?${query}` : ""}`);
    return data;
}

export async function fetchModule(moduleId: string | number): Promise<ModuleDetail> {
    const {data} = await api.get<{data: ModuleDetail}>(`/modules/${moduleId}`);
    return data.data;
}

export async function createModule(payload: Record<string, unknown>) {
    const {data} = await api.post<{data: ModuleDetail}>("/modules", payload);
    return data.data;
}

export async function updateModule(moduleId: string | number, payload: Record<string, unknown>) {
    const {data} = await api.patch<{data: ModuleDetail}>(`/modules/${moduleId}`, payload);
    return data.data;
}

export async function deleteModule(moduleId: string | number) {
    await api.delete(`/modules/${moduleId}`);
}
