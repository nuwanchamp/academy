import {H1} from "@/components/ui/typography/h1.tsx";
import {Logo} from "@/components/ui/Logo.tsx";
import {
    LucideBadge,
    LucideBookOpen,
    LucideCalendarClock,
    LucideChartArea,
    LucideLayoutDashboard,
    LucideSettings,
    LucideUsers
} from "lucide-react";
import NavLink from "@/components/ui/NavLink.tsx";

export const Sidebar = () => {
    return (
        <aside
            className="w-1/3 max-w-64 rounded-xl py-8 px-5 bg-primary top-2 bottom-2 fixed left-2 flex justify-between flex-col">
            <div className={"flex flex-row gap-2 items-center justify-start"}>
                <Logo className={"w-15"}/>
                <H1 className={"text-center text-white text-md tracking-wider uppercase"}>Rainbow Roots</H1>
            </div>
            <div>
                <nav className={"flex flex-col gap-6 items-start"}>
                    <NavLink icon={<LucideLayoutDashboard/>} name={"Dashboard"} route={"/dashboard"}/>
                    <NavLink icon={<LucideBookOpen/>} name={"Modules"} route={"/modules"}/>
                    <NavLink icon={<LucideBadge/>} name={"Learning Paths"} route={"/paths"}/>
                    <NavLink icon={<LucideUsers/>} name={"My Students"} route={"/students"}/>
                    <NavLink icon={<LucideCalendarClock/>} name={"Study Sessions"} route={"/study-sessions"}/>
                    <NavLink icon={<LucideChartArea/>} name={"Reports"} route={"/reports"}/>
                </nav>
            </div>
            <div>
                <nav>
                    <NavLink icon={<LucideSettings/>} name={"Settings"} route={"/settings"}/>
                </nav>
            </div>

        </aside>
    )
}
