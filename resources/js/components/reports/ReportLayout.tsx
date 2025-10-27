import {type ReactNode} from "react";
import PageHeading from "@/components/ui/PageHeading.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {
    Card,
    CardContent,
} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {cn} from "@/lib/utils.ts";

type HeroBadge = {
    label: string;
    variant?: "default" | "secondary" | "outline";
};

type HeroMeta = {
    label: string;
    value: string;
};

type ReportLayoutProps = {
    breadcrumbs: string[];
    lead: string;
    title: string;
    description: string;
    badges?: HeroBadge[];
    meta?: HeroMeta[];
    actions?: ReactNode;
    children: ReactNode;
};

export function ReportLayout({
    breadcrumbs,
    lead,
    title,
    description,
    badges,
    meta,
    actions,
    children,
}: ReportLayoutProps) {
    return (
        <div className="space-y-8 text-primary">
            <Card className="overflow-hidden border-none bg-gradient-to-r from-primary/10 via-primary/5 to-primary/20 shadow-md">
                <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                            {breadcrumbs.map((crumb, index) => (
                                <span key={crumb} className="flex items-center gap-2">
                                    <span>{crumb}</span>
                                    {index !== breadcrumbs.length - 1 && (
                                        <span className="inline-block h-0.5 w-7 bg-primary/40" aria-hidden />
                                    )}
                                </span>
                            ))}
                        </div>
                        <PageHeading lead={lead} title={title} />
                        <p className="max-w-3xl text-base text-muted-foreground">
                            {description}
                        </p>
                        {badges?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {badges.map((badge) => {
                                    const variant = badge.variant ?? "secondary";
                                    const classes =
                                        variant === "outline"
                                            ? "border-white/70 text-primary"
                                            : "bg-white/80 text-primary";

                                    return (
                                        <Badge
                                            key={badge.label}
                                            variant={variant}
                                            className={cn(classes)}
                                        >
                                            {badge.label}
                                        </Badge>
                                    );
                                })}
                            </div>
                        ) : null}
                        {meta?.length ? (
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                {meta.map((item, index) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span>{item.label}: <strong className="text-primary">{item.value}</strong></span>
                                        {index !== meta.length - 1 && (
                                            <Separator orientation="vertical" className="h-4 bg-white/70" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    {actions ? (
                        <div className="flex flex-col gap-3">
                            {actions}
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
