import {ComponentPropsWithoutRef} from "react";

import {cn} from "@/lib/utils";

type H4Props = ComponentPropsWithoutRef<"h4">;

export function H4({className, children, ...props}: H4Props) {
    return (
        <h4
            className={cn(
                "scroll-m-20 dark:text-white text-left text-xl font-extrabold tracking-tight text-balance",
                className,
            )}
            {...props}
        >
            {children}
        </h4>
    );
}
