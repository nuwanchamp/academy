import {ComponentPropsWithoutRef} from "react";

import {cn} from "@/lib/utils";

type H3Props = ComponentPropsWithoutRef<"h3">;

export function H3({className, children, ...props}: H3Props) {
    return (
        <h3
            className={cn(
                "scroll-m-20 text-gray-800 dark:text-white text-left text-2xl font-extrabold tracking-tight text-balance",
                className,
            )}
            {...props}
        >
            {children}
        </h3>
    );
}
