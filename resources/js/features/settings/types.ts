export type ProfileSettings = {
    fullName: string;
    preferredName: string;
    email: string;
    role: string;
    phone: string;
    status: "Active" | "Inactive";
    lastLoginAt: string | null;
    organization?: string;
};

export type PreferencesSettings = {
    language: string;
    timezone: string;
    weekStartsOn: "monday" | "sunday";
};

export type NotificationSettings = {
    studySessionReminders: boolean;
    progressReports: boolean;
    guardianMessages: boolean;
    digestEmails: boolean;
    smsAlerts: boolean;
    inAppMessages: boolean;
};

export type SecuritySettings = {
    lastPasswordChange: string | null;
    loginAlerts: boolean;
};

export type SettingsState = {
    profile: ProfileSettings;
    preferences: PreferencesSettings;
    notifications: NotificationSettings;
    security: SecuritySettings;
    studentOptions: StudentOptionSettings;
    moduleOptions: ModuleOptionSettings;
};

export type SettingsFeedback = {
    section: "profile" | "preferences" | "notifications" | "security" | "studentOptions" | "moduleOptions";
    type: "success" | "error";
    message: string;
};

export type PasswordChangePayload = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type StudentOptionSettings = {
    diagnoses: string[];
    evaluations: string[];
};

export type ModuleOptionSettings = {
    subjects: string[];
    gradeBands: string[];
};
