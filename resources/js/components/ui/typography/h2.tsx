import {ComponentPropsWithoutRef} from "react";

import {cn} from "@/lib/utils";

type H1Props = ComponentPropsWithoutRef<"h1">;

export function H2({className, children, ...props}: H1Props) {
    return (
        <h2
            className={cn(
                "scroll-m-20 text-gray-800 dark:text-white text-center text-3xl font-extrabold tracking-tight text-balance",
                className,
            )}
            {...props}
        >
            {children}
        </h2>
    );
}
