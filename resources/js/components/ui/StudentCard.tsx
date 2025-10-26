import {Card, CardContent} from "@/components/ui/card.tsx";
import {LucideUserCircle2} from "lucide-react";
import {H4} from "@/components/ui/typography/h4.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Badge} from "@/components/ui/badge.tsx";

export default function StudentCard() {
    return(
        <Card className={"w-full mt-4"}>
            <CardContent>
                <div className={"flex flex-row gap-4 items-center justify-start"}>
                    <div>
                        <LucideUserCircle2/>
                    </div>
                    <div className={"w-full"}>
                        <div className={"flex w-full flex-row gap-2 items-start justify-between"}>
                            <div>
                                <H4>Shenal JKody</H4>
                                <P className={"font-bold text-gray-500"}>Grade 4</P>
                            </div>
                            <Badge variant={"default"} className={"bg-green-700 text-white"}>Active</Badge>
                        </div>

                        <div className={"flex flex-row gap-4 items-center justify-start"}>
                            <div><span className={"font-light"}> Enrolled Modules :</span><span className={"font-bold"}>4</span></div>
                            <div><span className={"font-light"}> Completion Rate :</span><span className={"font-bold"}>56%</span></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
