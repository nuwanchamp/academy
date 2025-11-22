export type StudentListItem = {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name?: string | null;
    grade?: string | null;
    status?: string | null;
    date_of_birth?: string | null;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta?: {
        current_page?: number;
        last_page?: number;
        total?: number;
    };
    filters?: {
        grades?: string[];
    };
};

export type GuardianLink = {
    id: number;
    name: string;
    email: string;
    pivot?: {
        relationship?: string | null;
        is_primary?: boolean;
        access_level?: string | null;
        notifications_opt_in?: boolean;
    };
    profile?: {
        primary_phone?: string | null;
        address_line1?: string | null;
    };
};

export type StudentProfile = {
    id: number;
    first_name: string;
    last_name: string;
    preferred_name?: string | null;
    date_of_birth?: string | null;
    grade?: string | null;
    status?: string | null;
    notes?: string | null;
    assessment_summary?: string | null;
    ieps_or_goals?: string[] | null;
    risk_flags?: string[] | null;
    diagnoses?: string[] | null;
    guardians?: GuardianLink[];
    start_date?: string | null;
    case_manager_id?: number | null;
    teacher_id?: number | null;
};
