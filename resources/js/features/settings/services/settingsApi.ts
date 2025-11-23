import api from "@/lib/api_client.ts";

export type SettingsResponse = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        timezone: string;
        preferred_locale: string;
        phone: string | null;
        is_active: boolean;
    };
    settings: {
        notifications: Record<string, boolean>;
        login_alerts: boolean;
        last_password_change_at: string | null;
    };
};

export type TaxonomyKey = "student_diagnoses" | "student_evaluations" | "module_subjects" | "module_grade_bands";

export type Taxonomy = {
    key: TaxonomyKey;
    options: string[];
};

export const settingsApi = {
    async fetchSettings(): Promise<SettingsResponse> {
        const {data} = await api.get<SettingsResponse>("/settings/me");
        return data;
    },
    async updateProfile(payload: Record<string, unknown>): Promise<SettingsResponse> {
        const {data} = await api.patch<SettingsResponse>("/settings/me", payload);
        return data;
    },
    async updateNotifications(payload: Record<string, unknown>): Promise<SettingsResponse> {
        const {data} = await api.patch<SettingsResponse>("/settings/notifications", payload);
        return data;
    },
    async updatePassword(payload: {current_password: string; new_password: string; new_password_confirmation: string}): Promise<void> {
        await api.post("/settings/password", payload);
    },
    async fetchTaxonomies(): Promise<Taxonomy[]> {
        const {data} = await api.get<Taxonomy[] | {data: Taxonomy[]}>("/settings/taxonomies");
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray((data as {data?: Taxonomy[]}).data)) {
            return (data as {data: Taxonomy[]}).data;
        }
        return [];
    },
    async updateTaxonomy(key: TaxonomyKey, options: string[]): Promise<Taxonomy> {
        const {data} = await api.patch<Taxonomy>(`/settings/taxonomies/${key}`, {options});
        return data;
    },
};
