import {useCallback, useEffect, useMemo, useState} from "react";

import {useAuthStore} from "@/features/auth/store/useAuthStore.ts";
import {
    defaultModuleGradeBands,
    defaultModuleSubjects,
    defaultStudentDiagnoses,
    defaultStudentEvaluations,
    SETTINGS_STORAGE_KEY,
} from "@/features/settings/constants.ts";
import {settingsApi} from "@/features/settings/services/settingsApi.ts";
import type {
    NotificationSettings,
    PasswordChangePayload,
    PreferencesSettings,
    ProfileSettings,
    SecuritySettings,
    SettingsFeedback,
    SettingsState,
} from "@/features/settings/types.ts";

const createDefaultProfile = (): ProfileSettings => ({
    fullName: "Avery Johnson",
    preferredName: "Avery",
    email: "avery.johnson@example.edu",
    role: "teacher",
    phone: "+1 (202) 555-0148",
    status: "Active",
    lastLoginAt: null,
    organization: "Sunrise Academy",
});

const defaultNotifications: NotificationSettings = {
    studySessionReminders: true,
    progressReports: true,
    guardianMessages: true,
    digestEmails: false,
    smsAlerts: false,
    inAppMessages: true,
};

const defaultSecurity: SecuritySettings = {
    lastPasswordChange: null,
    loginAlerts: true,
};

const mapNotificationResponse = (incoming: Record<string, boolean> | undefined, fallback: NotificationSettings): NotificationSettings => ({
    studySessionReminders: incoming?.study_session_reminders ?? fallback.studySessionReminders,
    progressReports: incoming?.progress_reports ?? fallback.progressReports,
    guardianMessages: incoming?.guardian_messages ?? fallback.guardianMessages,
    digestEmails: incoming?.digest_emails ?? fallback.digestEmails,
    smsAlerts: incoming?.sms_alerts ?? fallback.smsAlerts,
    inAppMessages: incoming?.in_app_messages ?? fallback.inAppMessages,
});

const serializeNotifications = (notifications: NotificationSettings) => ({
    study_session_reminders: notifications.studySessionReminders,
    progress_reports: notifications.progressReports,
    guardian_messages: notifications.guardianMessages,
    digest_emails: notifications.digestEmails,
    sms_alerts: notifications.smsAlerts,
    in_app_messages: notifications.inAppMessages,
});

const normalizeSettings = (base: SettingsState, incoming?: Partial<SettingsState>): SettingsState => ({
    profile: {...base.profile, ...(incoming?.profile ?? {})},
    preferences: {...base.preferences, ...(incoming?.preferences ?? {})},
    notifications: {...base.notifications, ...(incoming?.notifications ?? {})},
    security: {...base.security, ...(incoming?.security ?? {})},
    studentOptions: {...base.studentOptions, ...(incoming?.studentOptions ?? {})},
    moduleOptions: {...base.moduleOptions, ...(incoming?.moduleOptions ?? {})},
});

const readStoredSettings = (fallback: SettingsState): SettingsState => {
    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const serialized = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!serialized) {
            return fallback;
        }
        const parsed = JSON.parse(serialized) as Partial<SettingsState>;
        return normalizeSettings(fallback, parsed);
    } catch {
        return fallback;
    }
};

export const useSettings = () => {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const canEditTaxonomies = user?.role === "admin";

    const initialTimezone = useMemo(() => {
        return user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    }, [user?.timezone]);

    const initialLanguage = useMemo(() => {
        return user?.preferred_locale ?? "en";
    }, [user?.preferred_locale]);

    const deriveDefaults = useCallback((): SettingsState => {
        const defaultProfile = createDefaultProfile();
        const fallbackProfile = {
            ...defaultProfile,
            fullName: user?.name ?? defaultProfile.fullName,
            preferredName: user?.name?.split(" ")[0] ?? defaultProfile.preferredName,
            email: user?.email ?? defaultProfile.email,
            role: user?.role ?? defaultProfile.role,
            status: user?.is_active === false ? "Inactive" : defaultProfile.status,
            lastLoginAt: user?.last_login_at ?? defaultProfile.lastLoginAt,
        };

        return {
            profile: fallbackProfile,
            preferences: {
                language: initialLanguage,
                timezone: initialTimezone,
                weekStartsOn: "monday",
            },
            notifications: defaultNotifications,
            security: defaultSecurity,
            studentOptions: {
                diagnoses: defaultStudentDiagnoses,
                evaluations: defaultStudentEvaluations,
            },
            moduleOptions: {
                subjects: defaultModuleSubjects,
                gradeBands: defaultModuleGradeBands,
            },
        };
    }, [initialLanguage, initialTimezone, user]);

    const [settings, setSettings] = useState<SettingsState>(() => readStoredSettings(deriveDefaults()));
    const [saving, setSaving] = useState<Record<SettingsFeedback["section"], boolean>>({
        profile: false,
        preferences: false,
        notifications: false,
        security: false,
        studentOptions: false,
        moduleOptions: false,
    });
    const [feedback, setFeedback] = useState<SettingsFeedback | null>(null);

    useEffect(() => {
        const defaults = deriveDefaults();
        setSettings((prev) => normalizeSettings(defaults, prev));

        const hydrate = async () => {
            try {
                const response = await settingsApi.fetchSettings();
                const hydrated: SettingsState = {
                    profile: {
                        ...defaults.profile,
                        fullName: response.user.name,
                        preferredName: response.user.name,
                        email: response.user.email,
                        role: response.user.role,
                        phone: response.user.phone ?? "",
                        status: response.user.is_active ? "Active" : "Inactive",
                        lastLoginAt: null,
                    },
                    preferences: {
                        ...defaults.preferences,
                        language: response.user.preferred_locale ?? defaults.preferences.language,
                        timezone: response.user.timezone ?? defaults.preferences.timezone,
                        weekStartsOn: defaults.preferences.weekStartsOn,
                    },
                    notifications: {
                        ...mapNotificationResponse(response.settings.notifications, defaults.notifications),
                    },
                    security: {
                        ...defaults.security,
                        loginAlerts: response.settings.login_alerts ?? defaults.security.loginAlerts,
                        lastPasswordChange: response.settings.last_password_change_at,
                    },
                    studentOptions: defaults.studentOptions,
                    moduleOptions: defaults.moduleOptions,
                };
                setSettings((prev) => normalizeSettings(hydrated, prev));
                updateUser({
                    preferred_locale: hydrated.preferences.language,
                    timezone: hydrated.preferences.timezone,
                });
            } catch {
                // Ignore API errors and keep defaults
            }
        };

        hydrate().then(() => {});
    }, [deriveDefaults, updateUser]);

    const persist = useCallback((next: SettingsState) => {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    }, []);

    const setSavingFor = (section: SettingsFeedback["section"], value: boolean) => {
        setSaving((prev) => ({...prev, [section]: value}));
    };

    const saveProfile = useCallback(async (profile: ProfileSettings) => {
        setSavingFor("profile", true);
        setFeedback(null);
        try {
            const response = await settingsApi.updateProfile({
                name: profile.fullName,
                preferred_name: profile.preferredName,
                phone: profile.phone,
                timezone: profile.timezone ?? settings.preferences.timezone,
                preferred_locale: settings.preferences.language,
            });
            const nextProfile: ProfileSettings = {
                ...profile,
                role: response.user.role,
                email: response.user.email,
                status: response.user.is_active ? "Active" : "Inactive",
            };
            const next: SettingsState = {...settings, profile: nextProfile};
            setSettings(next);
            persist(next);
            updateUser({name: profile.fullName, preferred_locale: settings.preferences.language, timezone: profile.timezone});
            setFeedback({section: "profile", type: "success", message: "Profile saved"});
        } catch (error) {
            setFeedback({section: "profile", type: "error", message: error instanceof Error ? error.message : "Unable to save profile."});
        } finally {
            setSavingFor("profile", false);
        }
    }, [persist, settings, updateUser]);

    const savePreferences = useCallback(async (preferences: PreferencesSettings) => {
        setSavingFor("preferences", true);
        setFeedback(null);
        try {
            const response = await settingsApi.updateProfile({
                preferred_locale: preferences.language,
                timezone: preferences.timezone,
            });
            const next: SettingsState = {...settings, preferences: {...settings.preferences, ...preferences}};
            setSettings(next);
            persist(next);
            updateUser({preferred_locale: preferences.language, timezone: preferences.timezone, name: response.user.name});
            setFeedback({section: "preferences", type: "success", message: "Preferences updated"});
        } catch (error) {
            setFeedback({section: "preferences", type: "error", message: error instanceof Error ? error.message : "Unable to update preferences."});
        } finally {
            setSavingFor("preferences", false);
        }
    }, [persist, settings, updateUser]);

    const saveNotifications = useCallback(async (notifications: NotificationSettings) => {
        setSavingFor("notifications", true);
        setFeedback(null);
        try {
            const response = await settingsApi.updateNotifications({
                notifications: serializeNotifications(notifications),
                login_alerts: settings.security.loginAlerts,
            });
            const nextNotifications = mapNotificationResponse(response.settings.notifications, notifications);
            const nextSecurity: SecuritySettings = {
                ...settings.security,
                loginAlerts: response.settings.login_alerts ?? settings.security.loginAlerts,
                lastPasswordChange: response.settings.last_password_change_at,
            };
            const next: SettingsState = {...settings, notifications: nextNotifications, security: nextSecurity};
            setSettings(next);
            persist(next);
            setFeedback({section: "notifications", type: "success", message: "Notification preferences updated"});
        } catch (error) {
            setFeedback({section: "notifications", type: "error", message: error instanceof Error ? error.message : "Unable to update notifications."});
        } finally {
            setSavingFor("notifications", false);
        }
    }, [persist, settings]);

    const saveSecurity = useCallback(async (payload: PasswordChangePayload) => {
        setSavingFor("security", true);
        setFeedback(null);

        if (payload.newPassword !== payload.confirmPassword) {
            setFeedback({section: "security", type: "error", message: "New passwords do not match"});
            setSavingFor("security", false);
            return;
        }

        if (payload.newPassword.length < 8) {
            setFeedback({section: "security", type: "error", message: "Use at least 8 characters"});
            setSavingFor("security", false);
            return;
        }

        try {
            await settingsApi.updatePassword({
                current_password: payload.currentPassword,
                new_password: payload.newPassword,
                new_password_confirmation: payload.confirmPassword,
            });
            const nextSecurity: SecuritySettings = {
                ...settings.security,
                lastPasswordChange: new Date().toISOString(),
            };
            const next: SettingsState = {...settings, security: nextSecurity};
            setSettings(next);
            persist(next);
            setFeedback({section: "security", type: "success", message: "Password updated"});
        } catch (error) {
            setFeedback({section: "security", type: "error", message: error instanceof Error ? error.message : "Unable to update password."});
        } finally {
            setSavingFor("security", false);
        }
    }, [persist, settings]);

    const updateLoginAlerts = useCallback(async (enabled: boolean) => {
        setSavingFor("security", true);
        setFeedback(null);
        try {
            await settingsApi.updateNotifications({
                notifications: settings.notifications,
                login_alerts: enabled,
            });
            const nextSecurity: SecuritySettings = {...settings.security, loginAlerts: enabled};
            const next: SettingsState = {...settings, security: nextSecurity};
            setSettings(next);
            persist(next);
            setFeedback({section: "security", type: "success", message: "Security preferences updated"});
        } catch (error) {
            setFeedback({section: "security", type: "error", message: error instanceof Error ? error.message : "Unable to update security preferences."});
        } finally {
            setSavingFor("security", false);
        }
    }, [persist, settings]);

    const saveStudentOptions = useCallback(async (diagnoses: string[], evaluations: string[]) => {
        setSavingFor("studentOptions", true);
        setFeedback(null);
        if (!canEditTaxonomies) {
            setFeedback({section: "studentOptions", type: "error", message: "Only admins can update these options."});
            setSavingFor("studentOptions", false);
            return;
        }
        try {
            await settingsApi.updateTaxonomy("student_diagnoses", diagnoses);
            await settingsApi.updateTaxonomy("student_evaluations", evaluations);
            const next: SettingsState = {
                ...settings,
                studentOptions: {
                    diagnoses: [...diagnoses],
                    evaluations: [...evaluations],
                },
            };
            setSettings(next);
            persist(next);
            setFeedback({section: "studentOptions", type: "success", message: "Student form options updated"});
        } catch (error) {
            setFeedback({section: "studentOptions", type: "error", message: error instanceof Error ? error.message : "Unable to update student options."});
        } finally {
            setSavingFor("studentOptions", false);
        }
    }, [canEditTaxonomies, persist, settings]);

    const saveModuleOptions = useCallback(async (subjects: string[], gradeBands: string[]) => {
        setSavingFor("moduleOptions", true);
        setFeedback(null);
        if (!canEditTaxonomies) {
            setFeedback({section: "moduleOptions", type: "error", message: "Only admins can update these options."});
            setSavingFor("moduleOptions", false);
            return;
        }
        try {
            await settingsApi.updateTaxonomy("module_subjects", subjects);
            await settingsApi.updateTaxonomy("module_grade_bands", gradeBands);
            const next: SettingsState = {
                ...settings,
                moduleOptions: {
                    subjects: [...subjects],
                    gradeBands: [...gradeBands],
                },
            };
            setSettings(next);
            persist(next);
            setFeedback({section: "moduleOptions", type: "success", message: "Module options updated"});
        } catch (error) {
            setFeedback({section: "moduleOptions", type: "error", message: error instanceof Error ? error.message : "Unable to update module options."});
        } finally {
            setSavingFor("moduleOptions", false);
        }
    }, [canEditTaxonomies, persist, settings]);

    return {
        settings,
        saving,
        feedback,
        saveProfile,
        savePreferences,
        saveNotifications,
        saveSecurity,
        updateLoginAlerts,
        saveStudentOptions,
        saveModuleOptions,
    };
};
