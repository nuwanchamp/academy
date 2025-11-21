import {H4} from "@/components/ui/typography/h4.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {LucideClock, MapPin} from "lucide-react";

type Props = {
    title: string;
    time: string;
    subtitle?: string;
    location?: string | null;
};

export default function UpcomingEvent({title, time, subtitle, location}: Props) {
    return (
        <div className={"flex flex-row gap-4 items-start justify-start p-3 group rounded-lg border border-gray-200 hover:border-primary/40 hover:bg-primary/5"}>
            <div className={"flex flex-col justify-center items-center rounded bg-primary/10 px-3 py-2 text-xs font-semibold text-primary uppercase"}>
                Soon
            </div>
            <div className={"flex flex-col items-start justify-between w-full"}>
                <div>
                    <H4 className={"mb-1"}>{title}</H4>
                    {subtitle && <P className={"text-xs text-muted-foreground"}>{subtitle}</P>}
                </div>
                <div className={"mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"}>
                    <span className={"inline-flex items-center gap-1"}><LucideClock className={"h-4 w-4"}/>{time}</span>
                    {location && <span className={"inline-flex items-center gap-1"}><MapPin className={"h-4 w-4"}/>{location}</span>}
                </div>
            </div>
        </div>
    )
}
