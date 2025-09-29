import {ReactNode} from "react";

export function H1({ children }: { children: ReactNode }) {
    return (
        <h1 className="scroll-m-20 text-gray-800 dark:text-white text-center text-4xl font-extrabold tracking-tight text-balance">
            {children}
        </h1>
    )
}
