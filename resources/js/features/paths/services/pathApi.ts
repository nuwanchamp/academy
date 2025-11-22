import api from "@/lib/api_client.ts";
import type {
    CreatePathPayload,
    ListPathsParams,
    PathDetail,
    PathFilters,
    PathSummary,
    UpdatePathPayload,
} from "../types/path";

export async function listPaths(params: ListPathsParams = {}): Promise<{
    data: PathSummary[];
    filters: PathFilters;
    meta: Record<string, any>;
}> {
    const response = await api.get("/paths", {params});
    const payload = response.data ?? {};

    return {
        data: payload.data ?? [],
        filters: payload.filters ?? {subjects: [], grade_bands: [], statuses: [], visibilities: []},
        meta: payload.meta ?? {},
    };
}

export async function fetchPath(id: number | string): Promise<PathDetail> {
    const response = await api.get(`/paths/${id}`);
    return response.data?.data;
}

export async function createPath(payload: CreatePathPayload): Promise<PathDetail> {
    const response = await api.post("/paths", payload);
    return response.data?.data;
}

export async function updatePath(id: number | string, payload: UpdatePathPayload): Promise<PathDetail> {
    const response = await api.patch(`/paths/${id}`, payload);
    return response.data?.data;
}
