import {H4} from "@/components/ui/typography/h4.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {LucideClock} from "lucide-react";

export default function UpcomingEvent() {
    return (
        <div className={"flex flex-row gap-4 items-start justify-start p-2 group hover:bg-primary/80 rounded-lg border-b border-gray-200 cursor-pointer"}>
            <div className={"flex gap-1 p-2 flex-col items-center rounded  bg-gray-200 w-1/4"}>
                <div>October</div>
                <H4 className={"text-2xl"}>20</H4>
                <P className={"text-gray-500 font-bold"}>Tuesday</P>
            </div>
            <div className={" flex flex-col items-start justify-between w-3/4 group-hover:text-white"}>
                <div>
                    <H4>Shenal JKody</H4>
                    <P>Class room </P>
                </div>
                <div className={"text-inherit flex flex-row gap-2"}>
                    <LucideClock className={"block w-4"}/>
                    <P>12.00 p.m</P>
                </div>
            </div>
        </div>
    )
}
