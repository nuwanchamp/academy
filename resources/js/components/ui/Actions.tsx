import {LucideBell, LucideSearch, LucideUser} from "lucide-react";
import {LanguageSwitcher} from "@/components/ui/LanguageSwitcher.tsx";

export default function Actions() {
    return (
        <div className={"flex gap-4 items-center text-gray-600"}>
            <LanguageSwitcher/>
            <div className="flex items-center gap-6">
                <LucideSearch/>
                <LucideBell/>
                <LucideUser/>
            </div>
        </div>
    )
}
