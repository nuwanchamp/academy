import i18next from "i18next";
import {initReactI18next} from "react-i18next";

const LANGUAGE_STORAGE_KEY = "rr-language";
const FALLBACK_LANGUAGE = "en";

const resources = {
    en: {
        dashboard: {
            heading: {
                lead: "Teacher's",
                title: "Dashboard",
            },
            quickActions: {
                newStudent: "New Student",
                createModule: "Create Module",
                createPath: "Create Paths",
                reports: "Reports",
            },
            students: {
                sectionTitle: "My Students",
                searchPlaceholder: "Search",
                filters: {
                    title: "Filters",
                    description: "Tune how students appear in your roster.",
                    moduleCount: "Modules",
                    grade: "Grade",
                    completion: "Completion",
                    gradePlaceholder: "Select a grade",
                    gradeOptions: {
                        grade3: "Grade 3",
                        grade4: "Grade 4",
                        grade5: "Grade 5",
                    },
                },
            },
            widgets: {
                calendar: {
                    title: "Calendar",
                    subtitle: "Schedule overview",
                },
                upcoming: {
                    title: "Upcoming",
                    subtitle: "Classes & Events",
                },
            },
            studentCard: {
                grade: "Grade {{grade}}",
                statusActive: "Active",
                enrolledModules: "Enrolled Modules",
                completionRate: "Completion Rate",
            },
            language: {
                english: "English",
                sinhala: "සිංහල",
                label: "Language",
            },
        },
    },
    si: {
        dashboard: {
            heading: {
                lead: "ගුරුවරුන්ගේ",
                title: "පාලන පුවරුව",
            },
            quickActions: {
                newStudent: "නව ශිෂ්‍යයා",
                createModule: "මොඩියුලයක් නිර්මාණය කරන්න",
                createPath: "ඉගෙනුම් මාර්ගයක් සකස් කරන්න",
                reports: "වාර්තා",
            },
            students: {
                sectionTitle: "මගේ ශිෂ්‍යයෝ",
                searchPlaceholder: "සොයන්න",
                filters: {
                    title: "පෙරහන්",
                    description: "ඔබගේ ලැයිස්තුවේ නිරූපණය හුරුපුරුදු කරන්න.",
                    moduleCount: "මොඩියුල",
                    grade: "ශ්‍රේණිය",
                    completion: "සම්පූර්ණතාව",
                    gradePlaceholder: "ශ්‍රේණිය තෝරන්න",
                    gradeOptions: {
                        grade3: "3 ශ්‍රේණිය",
                        grade4: "4 ශ්‍රේණිය",
                        grade5: "5 ශ්‍රේණිය",
                    },
                },
            },
            widgets: {
                calendar: {
                    title: "දිනදර්ශනය",
                    subtitle: "කාලසටහන සාරාංශය",
                },
                upcoming: {
                    title: "ඉදිරියට",
                    subtitle: "පන්ති සහ සිදුවීම්",
                },
            },
            studentCard: {
                grade: "{{grade}} ශ්‍රේණිය",
                statusActive: "සක්‍රීය",
                enrolledModules: "ලියාපදිංචි මොඩියුල",
                completionRate: "සම්පූර්ණතා අනුපාතය",
            },
            language: {
                english: "English",
                sinhala: "සිංහල",
                label: "භාෂාව",
            },
        },
    },
} as const;

const supportedLanguages = Object.keys(resources);

const detectInitialLanguage = () => {
    if (typeof window === "undefined") {
        return FALLBACK_LANGUAGE;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && supportedLanguages.includes(stored)) {
        return stored;
    }

    const browser = window.navigator.language?.split("-")[0];
    if (browser && supportedLanguages.includes(browser)) {
        return browser;
    }

    return FALLBACK_LANGUAGE;
};

const initialLanguage = detectInitialLanguage();

if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-lang", initialLanguage);
}

i18next
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: FALLBACK_LANGUAGE,
        lng: initialLanguage,
        defaultNS: "dashboard",
        interpolation: {
            escapeValue: false,
        },
    })
    .then(() => {
        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-lang", i18next.language);
        }
    });

i18next.on("languageChanged", (lng) => {
    if (typeof window !== "undefined") {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    }
    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-lang", lng);
    }
});

export {LANGUAGE_STORAGE_KEY, supportedLanguages};
