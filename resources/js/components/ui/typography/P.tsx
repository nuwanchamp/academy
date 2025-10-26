import {ComponentPropsWithoutRef} from "react";

import {cn} from "@/lib/utils";

type PProps = ComponentPropsWithoutRef<"p">;

export function P({className, children, ...props}: PProps) {
    return (
        <p
            className={cn(
                "dark:text-gray-200",
                className,
            )}
            {...props}
        >
            {children}
        </p>
    );
}
