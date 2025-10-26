import {LucideBell, LucideSearch, LucideUser} from "lucide-react";

export default function Actions() {
    return (
        <div className={"flex gap-6 items-center text-gray-600"}>
            <LucideSearch/>
            <LucideBell/>
            <LucideUser/>
        </div>
    )
}
