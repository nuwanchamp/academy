import {FormEvent, useEffect, useMemo, useState} from "react";
import {
    LucideBell,
    LucideGauge,
    LucideLanguages,
    LucideShield,
    LucideShieldCheck,
    LucideSmartphone,
    LucideUserCog,
    LucideUserRound,
} from "lucide-react";

import PageHeading from "@/components/ui/PageHeading.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {languageOptions} from "@/components/ui/LanguageSwitcher.tsx";
import {popularTimezones} from "@/features/settings/constants.ts";
import {useSettings} from "@/features/settings/hooks/useSettings.ts";
import {useTaxonomies} from "@/features/settings/hooks/useTaxonomies.ts";
import type {
    NotificationSettings,
    PasswordChangePayload,
    PreferencesSettings,
    ProfileSettings,
    SettingsState,
    SettingsFeedback,
} from "@/features/settings/types.ts";
import {useAuthStore} from "@/features/auth/store/useAuthStore.ts";
import {cn} from "@/lib/utils.ts";

const weekStartOptions: PreferencesSettings["weekStartsOn"][] = ["monday", "sunday"];

export default function Settings() {
    const {
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
    } = useSettings();
    const {
        diagnoses,
        evaluations,
        subjects,
        gradeBands,
    } = useTaxonomies();
    const currentUser = useAuthStore((state) => state.user);

    const [profileForm, setProfileForm] = useState<ProfileSettings>(settings.profile);
    const [preferencesForm, setPreferencesForm] = useState<PreferencesSettings>(settings.preferences);
    const [notificationsForm, setNotificationsForm] = useState<NotificationSettings>(settings.notifications);
    const [passwordForm, setPasswordForm] = useState<PasswordChangePayload>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [studentOptions, setStudentOptions] = useState<SettingsState["studentOptions"]>({
        diagnoses: diagnoses,
        evaluations: evaluations,
    });
    const [moduleOptions, setModuleOptions] = useState<SettingsState["moduleOptions"]>({
        subjects: subjects,
        gradeBands: gradeBands,
    });
    const [activeTab, setActiveTab] = useState<"general" | "profile" | "preferences" | "security">("general");
    const isAdmin = currentUser?.role === "admin";

    useEffect(() => {
        setProfileForm(settings.profile);
    }, [settings.profile]);

    useEffect(() => {
        setPreferencesForm(settings.preferences);
    }, [settings.preferences]);

    useEffect(() => {
        setNotificationsForm(settings.notifications);
    }, [settings.notifications]);

    useEffect(() => {
        setStudentOptions({diagnoses, evaluations});
    }, [diagnoses, evaluations]);

    useEffect(() => {
        setModuleOptions({subjects, gradeBands});
    }, [subjects, gradeBands]);

    const friendlyLastLogin = useMemo(() => {
        if (!settings.profile.lastLoginAt) {
            return "—";
        }
        const parsed = new Date(settings.profile.lastLoginAt);
        if (Number.isNaN(parsed.getTime())) {
            return settings.profile.lastLoginAt;
        }
        return new Intl.DateTimeFormat(undefined, {month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"}).format(parsed);
    }, [settings.profile.lastLoginAt]);

    const friendlyLastPasswordChange = useMemo(() => {
        if (!settings.security.lastPasswordChange) {
            return "Not recorded";
        }
        const parsed = new Date(settings.security.lastPasswordChange);
        if (Number.isNaN(parsed.getTime())) {
            return settings.security.lastPasswordChange;
        }
        return new Intl.DateTimeFormat(undefined, {month: "short", day: "numeric", year: "numeric"}).format(parsed);
    }, [settings.security.lastPasswordChange]);

    const showFeedback = (section: SettingsFeedback["section"]) => {
        if (!feedback) {
            return null;
        }
        if (feedback.section !== section) {
            return null;
        }
        const color = feedback.type === "success" ? "text-emerald-600" : "text-destructive";
        return (
            <p className={cn("text-sm", color)} role="status" aria-live="polite">
                {feedback.message}
            </p>
        );
    };

    const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveProfile(profileForm);
    };

    const handlePreferencesSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await savePreferences(preferencesForm);
    };

    const handleNotificationsSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveNotifications(notificationsForm);
    };

    const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveSecurity(passwordForm);
        setPasswordForm({currentPassword: "", newPassword: "", confirmPassword: ""});
    };

    const handleStudentOptionsSave = async () => {
        await saveStudentOptions(studentOptions.diagnoses, studentOptions.evaluations);
    };

    const handleModuleOptionsSave = async () => {
        await saveModuleOptions(moduleOptions.subjects, moduleOptions.gradeBands);
    };

    return (
        <div className="space-y-8 text-primary">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <PageHeading lead="Preferences" title="Settings" />
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LucideUserCog className="size-4" />
                    <span>Manage your account, preferences, and security.</span>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general" className="gap-2" onClick={() => setActiveTab("general")}>
                        <LucideGauge className="size-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2" onClick={() => setActiveTab("profile")}>
                        <LucideUserRound className="size-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2" onClick={() => setActiveTab("preferences")}>
                        <LucideLanguages className="size-4" /> Preferences
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2" onClick={() => setActiveTab("security")}>
                        <LucideShield className="size-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LucideGauge className="size-4" />
                                    Form defaults
                                </CardTitle>
                                <CardDescription>Manage the options shown on student and module pages.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-6">
                                    <CardTitle className="text-lg">Student form options</CardTitle>
                                    <EditableTagList
                                        label="Diagnose options"
                                        description="Shown in the Diagnose list when creating a student."
                                        values={studentOptions.diagnoses}
                                        onChange={(next) => setStudentOptions((prev) => ({...prev, diagnoses: next}))}
                                        placeholder="Add diagnosis"
                                    />
                                    <EditableTagList
                                        label="Initial evaluation options"
                                        description="Observations available in the Initial Evaluation checklist."
                                        values={studentOptions.evaluations}
                                        onChange={(next) => setStudentOptions((prev) => ({...prev, evaluations: next}))}
                                        placeholder="Add evaluation note"
                                    />
                                    {showFeedback("studentOptions")}
                                    <div className="flex justify-end">
                                        <Button onClick={handleStudentOptionsSave} disabled={saving.studentOptions}>Save student options</Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-6">
                                    <CardTitle className="text-lg">Module dropdowns</CardTitle>
                                    <EditableTagList
                                        label="Subjects"
                                        description="Subjects available in module creation and filters."
                                        values={moduleOptions.subjects}
                                        onChange={(next) => setModuleOptions((prev) => ({...prev, subjects: next}))}
                                        placeholder="Add subject"
                                    />
                                    <EditableTagList
                                        label="Grade bands"
                                        description="Grade bands teachers can select for modules."
                                        values={moduleOptions.gradeBands}
                                        onChange={(next) => setModuleOptions((prev) => ({...prev, gradeBands: next}))}
                                        placeholder="Add grade band"
                                    />
                                    {showFeedback("moduleOptions")}
                                    <div className="flex justify-end">
                                        <Button onClick={handleModuleOptionsSave} variant="secondary" disabled={saving.moduleOptions}>Save module options</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LucideBell className="size-4" />
                                        Notification preferences
                                    </CardTitle>
                                    <CardDescription>Control reminders and updates sent to you.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4" onSubmit={handleNotificationsSubmit}>
                                        <FieldSet className="space-y-4">
                                            <NotificationToggle
                                                label="Study session reminders"
                                                description="Daily reminders for upcoming sessions."
                                                checked={notificationsForm.studySessionReminders}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, studySessionReminders: checked}))}
                                            />
                                            <NotificationToggle
                                                label="Progress reports"
                                                description="Weekly digest of student progress."
                                                checked={notificationsForm.progressReports}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, progressReports: checked}))}
                                            />
                                            <NotificationToggle
                                                label="Guardian messages"
                                                description="Alerts when guardians reply or request updates."
                                                checked={notificationsForm.guardianMessages}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, guardianMessages: checked}))}
                                            />
                                            <NotificationToggle
                                                label="Digest emails"
                                                description="Combine notifications into one daily email."
                                                checked={notificationsForm.digestEmails}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, digestEmails: checked}))}
                                            />
                                            <NotificationToggle
                                                label="SMS alerts"
                                                description="Text alerts for high-priority updates."
                                                checked={notificationsForm.smsAlerts}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, smsAlerts: checked}))}
                                            />
                                            <NotificationToggle
                                                label="In-app messages"
                                                description="Show banners and inbox updates in the dashboard."
                                                checked={notificationsForm.inAppMessages}
                                                onChange={(checked) => setNotificationsForm((prev) => ({...prev, inAppMessages: checked}))}
                                            />
                                        </FieldSet>
                                        <CardFooter className="flex flex-col items-start gap-3 px-0">
                                            {showFeedback("notifications")}
                                            <div className="flex w-full items-center justify-between gap-3">
                                                <div className="text-sm text-muted-foreground">Stay notified about lessons and guardian replies.</div>
                                                <Button type="submit" variant="secondary" disabled={saving.notifications}>Save notifications</Button>
                                            </div>
                                        </CardFooter>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LucideGauge className="size-4" />
                                        Account snapshot
                                    </CardTitle>
                                    <CardDescription>Quick view of your current session.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Role</span>
                                        <Badge variant="outline" className="uppercase">{profileForm.role}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant={profileForm.status === "Active" ? "default" : "secondary"}>{profileForm.status}</Badge>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <LucideSmartphone className="size-4" />
                                            <span>{profileForm.phone || "No phone on file"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LucideShieldCheck className="size-4" />
                                            <span>Password updated {settings.security.lastPasswordChange ? friendlyLastPasswordChange : "not set"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LucideUserRound className="size-4" />
                                Profile & contact
                            </CardTitle>
                            <CardDescription>Update what teammates and families see on rosters and reports.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handleProfileSubmit}>
                                <FieldSet>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="fullName"
                                                    value={profileForm.fullName}
                                                    onChange={(event) => setProfileForm((prev) => ({...prev, fullName: event.target.value}))}
                                                    placeholder="Enter your full name"
                                                />
                                                <FieldDescription>Shown on lesson reports and guardian messages.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="preferredName">Preferred name</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="preferredName"
                                                    value={profileForm.preferredName}
                                                    onChange={(event) => setProfileForm((prev) => ({...prev, preferredName: event.target.value}))}
                                                    placeholder="How you want to be addressed"
                                                />
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <FieldContent>
                                                <Input id="email" value={profileForm.email} disabled readOnly />
                                                <FieldDescription>Contact your admin to change your login email.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="phone"
                                                    value={profileForm.phone}
                                                    onChange={(event) => setProfileForm((prev) => ({...prev, phone: event.target.value}))}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                    <FieldGroup className="grid gap-4 md:grid-cols-3">
                                        <Field>
                                            <FieldLabel htmlFor="role">Role</FieldLabel>
                                            <FieldContent>
                                                <Input id="role" value={profileForm.role} disabled readOnly />
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Status</FieldLabel>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={profileForm.status === "Active" ? "default" : "secondary"} className="uppercase">
                                                    {profileForm.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Last login {friendlyLastLogin}</span>
                                            </div>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="organization">Organization</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="organization"
                                                    value={profileForm.organization ?? ""}
                                                    onChange={(event) => setProfileForm((prev) => ({...prev, organization: event.target.value}))}
                                                    placeholder="School or district"
                                                />
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <CardFooter className="flex flex-col items-start gap-3 px-0">
                                    {showFeedback("profile")}
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="text-sm text-muted-foreground">Save to refresh your roster and reports.</div>
                                        <Button type="submit" disabled={saving.profile}>Save changes</Button>
                                    </div>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LucideLanguages className="size-4" />
                                Language & locale
                            </CardTitle>
                            <CardDescription>Choose how Rainbow Roots formats dates and copy.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handlePreferencesSubmit}>
                                <FieldSet>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel>Language</FieldLabel>
                                            <FieldContent>
                                                <Select
                                                    value={preferencesForm.language}
                                                    onValueChange={(value) => setPreferencesForm((prev) => ({...prev, language: value}))}
                                                >
                                                    <SelectTrigger aria-label="Language">
                                                        <SelectValue placeholder="Choose language" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {languageOptions.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldDescription>Applies instantly across the dashboard.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Time zone</FieldLabel>
                                            <FieldContent>
                                                <Select
                                                    value={preferencesForm.timezone}
                                                    onValueChange={(value) => setPreferencesForm((prev) => ({...prev, timezone: value}))}
                                                >
                                                    <SelectTrigger aria-label="Time zone">
                                                        <SelectValue placeholder="Select a time zone" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {popularTimezones.map((zone) => (
                                                            <SelectItem key={zone} value={zone}>
                                                                {zone}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldDescription>Used for scheduling, reminders, and reports.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                    <FieldGroup className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel>Week starts on</FieldLabel>
                                            <FieldContent className="flex flex-col gap-2">
                                                {weekStartOptions.map((value) => (
                                                    <label key={value} className="flex items-center justify-between rounded-md border p-3">
                                                        <span className="text-sm capitalize">{value}</span>
                                                        <Switch
                                                            checked={preferencesForm.weekStartsOn === value}
                                                            onCheckedChange={() => setPreferencesForm((prev) => ({...prev, weekStartsOn: value}))}
                                                            aria-label={`Week starts on ${value}`}
                                                        />
                                                    </label>
                                                ))}
                                                <FieldDescription>Calendars will align to your preference.</FieldDescription>
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <CardFooter className="flex flex-col items-start gap-3 px-0">
                                    {showFeedback("preferences")}
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="text-sm text-muted-foreground">Language updates will reflect after refresh.</div>
                                        <Button type="submit" disabled={saving.preferences}>Save locale</Button>
                                    </div>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LucideShield className="size-4" />
                                Security
                            </CardTitle>
                            <CardDescription>Reset your password and review security signals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                                <FieldSet>
                                    <FieldGroup className="grid gap-4 md:grid-cols-3">
                                        <Field>
                                            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(event) => setPasswordForm((prev) => ({...prev, currentPassword: event.target.value}))}
                                                    placeholder="••••••••"
                                                />
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={(event) => setPasswordForm((prev) => ({...prev, newPassword: event.target.value}))}
                                                    placeholder="Minimum 8 characters"
                                                />
                                            </FieldContent>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(event) => setPasswordForm((prev) => ({...prev, confirmPassword: event.target.value}))}
                                                    placeholder="Re-enter password"
                                                />
                                            </FieldContent>
                                        </Field>
                                    </FieldGroup>
                                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Login alerts</span>
                                            <span className="text-sm text-muted-foreground">Notify me when a new device signs in.</span>
                                        </div>
                                        <Switch
                                            checked={settings.security.loginAlerts}
                                            onCheckedChange={(checked) => {
                                                void updateLoginAlerts(checked);
                                            }}
                                            aria-label="Toggle login alerts"
                                        />
                                    </div>
                                </FieldSet>
                                <CardFooter className="flex flex-col items-start gap-3 px-0">
                                    {showFeedback("security")}
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="text-sm text-muted-foreground">Password last updated: {friendlyLastPasswordChange}</div>
                                        <Button type="submit" variant="outline" disabled={saving.security}>Update password</Button>
                                    </div>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

type NotificationToggleProps = {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

function NotificationToggle({label, description, checked, onChange}: NotificationToggleProps) {
    return (
        <label className="flex items-start justify-between gap-4 py-2">
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
        </label>
    );
}

type EditableTagListProps = {
    label: string;
    description?: string;
    values: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
};

function EditableTagList({label, description, values, onChange, placeholder}: EditableTagListProps) {
    const [draft, setDraft] = useState("");

    const addValue = () => {
        const trimmed = draft.trim();
        if (!trimmed || values.includes(trimmed)) {
            setDraft("");
            return;
        }
        onChange([...values, trimmed]);
        setDraft("");
    };

    const removeValue = (value: string) => {
        onChange(values.filter((item) => item !== value));
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addValue();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{label}</span>
                {description && <span className="text-sm text-muted-foreground">{description}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                    <Badge key={value} variant="secondary" className="flex items-center gap-2">
                        {value}
                        <button
                            type="button"
                            aria-label={`Remove ${value}`}
                            className="text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => removeValue(value)}
                        >
                            ×
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder ?? "Add item"}
                />
                <Button type="button" onClick={addValue}>Add</Button>
            </div>
        </div>
    );
}
