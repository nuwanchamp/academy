export type PathStatus = "draft" | "published" | "archived";
export type PathVisibility = "private" | "school" | "district";

export interface PathSummary {
    id: number;
    uuid: string;
    code: string;
    title: string;
    summary: string | null;
    subject: string | null;
    grade_band: string | null;
    status: PathStatus;
    visibility: PathVisibility;
    pacing: string | null;
    modules_count: number;
    updated_at?: string | null;
}

export interface PathModuleSummary {
    id: number;
    code: string;
    title: string;
    sequence_order: number;
}

export interface PathDetail extends PathSummary {
    objectives: string[];
    success_metrics: string[];
    planned_release_date?: string | null;
    published_at?: string | null;
    archived_at?: string | null;
    owner?: {
        id: number;
        name: string;
        email: string;
    } | null;
    modules: PathModuleSummary[];
}

export interface PathFilters {
    subjects: string[];
    grade_bands: string[];
    statuses: string[];
    visibilities: string[];
}

export interface ListPathsParams {
    search?: string;
    subject?: string;
    grade_band?: string;
    status?: PathStatus;
    visibility?: PathVisibility;
    page?: number;
    per_page?: number;
}

export interface CreatePathPayload {
    code: string;
    title: string;
    summary?: string | null;
    subject?: string | null;
    grade_band?: string | null;
    status?: PathStatus;
    visibility?: PathVisibility;
    pacing?: string | null;
    objectives?: string[];
    success_metrics?: string[];
    planned_release_date?: string | null;
    modules?: Array<{id: number; sequence_order?: number}>;
}

export type UpdatePathPayload = Partial<CreatePathPayload>;
