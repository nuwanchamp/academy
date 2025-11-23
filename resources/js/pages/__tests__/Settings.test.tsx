import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import {BrowserRouter} from "react-router-dom";

import {SETTINGS_STORAGE_KEY} from "@/features/settings/constants";
import Settings from "@/pages/Settings";
import {settingsApi} from "@/features/settings/services/settingsApi";

jest.mock("@/features/settings/services/settingsApi");

const mockedSettingsApi = settingsApi as jest.Mocked<typeof settingsApi>;

beforeEach(() => {
    mockedSettingsApi.fetchSettings.mockResolvedValue({
        user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "teacher",
            timezone: "UTC",
            preferred_locale: "en",
            phone: "123",
            is_active: true,
        },
        settings: {
            notifications: {
                study_session_reminders: true,
                progress_reports: true,
                guardian_messages: true,
                digest_emails: false,
                sms_alerts: false,
                in_app_messages: true,
            },
            login_alerts: true,
            last_password_change_at: null,
        },
    });
    mockedSettingsApi.updateProfile.mockResolvedValue({
        user: {
            id: 1,
            name: "Updated",
            email: "test@example.com",
            role: "teacher",
            timezone: "UTC",
            preferred_locale: "en",
            phone: "123",
            is_active: true,
        },
        settings: {
            notifications: {},
            login_alerts: true,
            last_password_change_at: null,
        },
    });
    mockedSettingsApi.updateNotifications.mockResolvedValue({
        user: {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            role: "teacher",
            timezone: "UTC",
            preferred_locale: "en",
            phone: "123",
            is_active: true,
        },
        settings: {
            notifications: {
                study_session_reminders: false,
                progress_reports: false,
                guardian_messages: true,
                digest_emails: true,
                sms_alerts: true,
                in_app_messages: false,
            },
            login_alerts: false,
            last_password_change_at: null,
        },
    });
    mockedSettingsApi.updatePassword.mockResolvedValue();
    mockedSettingsApi.fetchTaxonomies.mockResolvedValue([]);
    mockedSettingsApi.updateTaxonomy.mockResolvedValue({key: "student_diagnoses", options: []});
});

const renderSettings = () => {
    return render(
        <BrowserRouter>
            <Settings/>
        </BrowserRouter>
    );
};

describe("Settings page", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test("renders tabs and switches content", () => {
        renderSettings();

        expect(screen.getByRole("tab", {name: /General/i})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: /Profile/i})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: /Preferences/i})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: /Security/i})).toBeInTheDocument();

        expect(screen.getByText(/Notification preferences/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("tab", {name: /Profile/i}));
        expect(screen.getByText(/Profile & contact/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("tab", {name: /Preferences/i}));
        expect(screen.getByText(/Language & locale/)).toBeInTheDocument();
    });

    test("saves profile changes to storage", async () => {
        renderSettings();

        fireEvent.click(screen.getByRole("tab", {name: /Profile/i}));

        const nameInput = screen.getByLabelText(/Full name/);
        fireEvent.change(nameInput, {target: {value: "Jordan Teacher"}});

        fireEvent.click(screen.getByRole("button", {name: /Save changes/}));

        await waitFor(() => {
            expect(screen.getByText(/Profile saved/)).toBeInTheDocument();
        });

        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(String(stored));
        expect(parsed.profile.fullName).toBe("Jordan Teacher");
    });

    test("updates notification toggles", async () => {
        renderSettings();

        const digestToggle = screen.getByLabelText(/Digest emails/);
        fireEvent.click(digestToggle);

        fireEvent.click(screen.getByRole("button", {name: /Save notifications/}));

        await waitFor(() => {
            expect(screen.getByText(/Notification preferences updated/)).toBeInTheDocument();
        });

        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(String(stored));
        expect(parsed.notifications.digestEmails).toBe(true);
    });
});
