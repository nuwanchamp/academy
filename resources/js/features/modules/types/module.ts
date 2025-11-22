export type ModuleSummary = {
    id: number;
    uuid: string;
    code: string;
    title: string;
    summary?: string | null;
    subject?: string | null;
    grade_band?: string | null;
    status?: string | null;
    version_label?: string | null;
    difficulty?: string | null;
    estimated_duration?: string | null;
    learning_type?: string | null;
    lessons_count?: number | null;
    tags?: string[];
    updated_at?: string | null;
};

export type ModuleAuthor = {
    id?: number;
    name: string;
    role?: string | null;
    bio?: string | null;
    contact_links?: Array<{label: string; href: string}>;
};

export type LessonMaterial = {
    id?: number;
    name: string;
    file_type?: string | null;
    file_size_bytes?: number | null;
    storage_path?: string | null;
    external_url?: string | null;
    meta?: Record<string, unknown>;
};

export type LessonMediaUpload = {
    id?: number;
    file_name: string;
    storage_path?: string | null;
    mime_type?: string | null;
    file_size_bytes?: number | null;
    meta?: Record<string, unknown>;
};

export type ModuleLesson = {
    id: number;
    sequence_order: number;
    title: string;
    summary?: string | null;
    objectives?: string[];
    body?: string | null;
    instructions?: string | null;
    outcomes?: string[];
    materials?: LessonMaterial[];
    media_uploads?: LessonMediaUpload[];
};

export type ModuleDetail = ModuleSummary & {
    objectives?: string[];
    prerequisites?: string[];
    progress_tracking?: string | null;
    completion_criteria?: string | null;
    feedback_strategy?: string | null;
    access_control?: string | null;
    published_at?: string | null;
    archived_at?: string | null;
    authors?: ModuleAuthor[];
    lessons?: ModuleLesson[];
};

export type PaginatedResponse<T> = {
    data: T[];
    meta?: {
        current_page?: number;
        last_page?: number;
        total?: number;
    };
    filters?: {
        subjects?: string[];
        grade_bands?: string[];
        statuses?: string[];
    };
};
