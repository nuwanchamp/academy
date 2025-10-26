import {Link, useLocation} from "react-router-dom";
import {ReactElement} from "react";

import {cn} from "@/lib/utils";
import Indicator from "@/components/ui/indicator.tsx";

type NavLinkProps = {
    icon: ReactElement,
    name: string,
    route: string,
}
export default function NavLink({icon, name, route}: NavLinkProps) {
    const {pathname} = useLocation();
    const isActive = pathname === route || pathname.startsWith(`${route}/`);

    return (
        <>
            <Link
                to={route}
                className={cn(
                    "flex items-center gap-2 text-white/80 transition hover:text-white hover:opacity-100",
                    isActive && "text-white font-semibold",
                )}
                aria-current={isActive ? "page" : undefined}
            >
                {isActive &&
                   <Indicator/>
                }
                <span className={"opacity-50"}>
                   {icon}
                </span>
                <span className={cn(
                    "text-white/80 transition hover:text-white",
                    isActive && "text-white font-bold",
                )}>{name}</span>
            </Link>
        </>
    );
}
