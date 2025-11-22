export const DEFAULT_GRADE_FILTER = "All grades";
export const DEFAULT_STATUS_FILTER = "ALL";
export const STATUS_OPTIONS: Array<{value: string; label: string}> = [
    {value: DEFAULT_STATUS_FILTER, label: "All statuses"},
    {value: "active", label: "Active"},
    {value: "onboarding", label: "Onboarding"},
    {value: "archived", label: "Archived"},
];
export const PAGE_SIZE = 3;

export const STUDENT_STATUS_LABELS: Record<string, string> = {
    onboarding: "Onboarding",
    active: "Active",
    archived: "Archived",
};

export const STUDENT_STATUS_TONES: Record<string, "default" | "secondary" | "outline"> = {
    onboarding: "secondary",
    active: "default",
    archived: "outline",
};
