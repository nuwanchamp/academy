import {Card, CardContent} from "@/components/ui/card.tsx";
import {LucideUserCircle2} from "lucide-react";
import {H4} from "@/components/ui/typography/h4.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {useTranslation} from "react-i18next";

export default function StudentCard() {
    const {t} = useTranslation("dashboard");
    const grade = 4;
    const enrolledModules = 4;
    const completionRate = 56;

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
                                <P className={"font-bold text-gray-500"}>{t("studentCard.grade", {grade})}</P>
                            </div>
                            <Badge variant={"default"} className={"bg-green-700 text-white"}>
                                {t("studentCard.statusActive")}
                            </Badge>
                        </div>

                        <div className={"flex flex-row gap-4 items-center justify-start"}>
                            <div>
                                <span className={"font-light"}> {t("studentCard.enrolledModules")} :</span>
                                <span className={"font-bold"}>{enrolledModules}</span>
                            </div>
                            <div>
                                <span className={"font-light"}> {t("studentCard.completionRate")} :</span>
                                <span className={"font-bold"}>{completionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
