import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useTranslation} from "react-i18next";
import {useMemo} from "react";
import {cn} from "@/lib/utils.ts";

export const languageOptions = [
    {value: "en", label: "English", className: ""},
    {value: "si", label: "සිංහල", className: "font-sinhala"},
] as const;

export function LanguageSwitcher() {
    const {i18n, t} = useTranslation("dashboard");

    const normalizedLanguage = useMemo(() => {
        const base = i18n.language?.split("-")[0] ?? "en";
        return languageOptions.some((option) => option.value === base) ? base : "en";
    }, [i18n.language]);

    const handleChange = (value: string) => {
        void i18n.changeLanguage(value);
    };

    const currentOption = languageOptions.find((option) => option.value === normalizedLanguage) ?? languageOptions[0];

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("language.label")}
            </span>
            <Select value={normalizedLanguage} onValueChange={handleChange}>
                <SelectTrigger className="w-[140px] justify-between">
                    <span className={cn("text-sm font-medium", currentOption.className)}>
                        {currentOption.label}
                    </span>
                    <SelectValue aria-label={currentOption.label} placeholder={currentOption.label} className="sr-only" />
                </SelectTrigger>
                <SelectContent>
                    {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className={option.className}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
