import PageHeading from "@/components/ui/PageHeading.tsx";
import Actions from "@/components/ui/Actions.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {H3} from "@/components/ui/typography/h3";
import {P} from "@/components/ui/typography/P.tsx";
import UpcomingEvent from "@/components/ui/UpcomingEvent.tsx";
import StudentCard from "@/components/ui/StudentCard.tsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {LucideFilter, LucideSearch} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@radix-ui/react-dropdown-menu";
import {Slider} from "@/components/ui/slider.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

const studentImageSrc = new URL("../../assets/students.svg", import.meta.url).href;
const modulesImageSrc = new URL("../../assets/modules.svg", import.meta.url).href;
const pathsImageSrc = new URL("../../assets/paths.svg", import.meta.url).href;
const reportsImageSrc = new URL("../../assets/reports.svg", import.meta.url).href;

export const Dashboard = () => {

    const navigate = useNavigate();
    const {t} = useTranslation("dashboard");

    const quickActions = [
        {
            key: "newStudent",
            image: studentImageSrc,
            label: t("quickActions.newStudent"),
            alt: t("quickActions.newStudent"),
            onClick: () => {
                navigate("/students/create");
            },
        },
        {
            key: "createModule",
            image: modulesImageSrc,
            label: t("quickActions.createModule"),
            alt: t("quickActions.createModule"),
            onClick: () => {
                navigate("/module/create");
            },
        },
        {
            key: "createPath",
            image: pathsImageSrc,
            label: t("quickActions.createPath"),
            alt: t("quickActions.createPath"),
            onClick: () => {
                navigate("/path/create");
            },
        },
        {
            key: "reports",
            image: reportsImageSrc,
            label: t("quickActions.reports"),
            alt: t("quickActions.reports"),
            onClick: () => {
                navigate("/reports");
            },
        },
    ] as const;

    const gradeOptions = [
        {value: "grade3", label: t("students.filters.gradeOptions.grade3")},
        {value: "grade4", label: t("students.filters.gradeOptions.grade4")},
        {value: "grade5", label: t("students.filters.gradeOptions.grade5")},
    ];

    return (
        <>
            <div className={"w-full flex justify-between items-center"}>
                <PageHeading lead={t("heading.lead")} title={t("heading.title")}/>
                <Actions/>
            </div>
            <div className={"w-full flex gap-4 justify-between items-start"}>
                <div className={"flex w-2/3 flex-col gap-4 mt-6 justify-between"}>
                    <div className={"flex flex-row gap-4 mt-6 justify-between"}>
                        {quickActions.map((action) => (
                            <Card
                                key={action.key}
                                className={"w-1/4 cursor-pointer hover:shadow-lg hover:border-primary/20"}
                                onClick={action.onClick}
                            >
                                <CardContent>
                                    <div className={"flex flex-col gap-4 items-center justify-start"}>
                                        <img src={action.image} alt={action.alt} className={"w-40"}/>
                                        <h3 className={action.key === "reports" ? "font-semibold" : ""}>{action.label}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className={"w-full"}>
                        <H3>{t("students.sectionTitle")}</H3>
                        <div className={"mt-6 flex flex-row gap-4 justify-between mb-6"}>
                            <div className="flex w-full max-w-sm items-center gap-2 text-inherit">
                                <Input type="search" placeholder={t("students.searchPlaceholder")}/>
                                <Button type="submit" variant="outline" className={" group hover:bg-primary cursor-pointer"}>
                                    <LucideSearch className={"text-primary group-hover:text-white"}/>
                                </Button>
                            </div>
                            <div className={"text-primary"}>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button  variant="ghost"><LucideFilter/></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <h4 className="leading-none font-medium">{t("students.filters.title")}</h4>
                                                <p className="text-muted-foreground text-sm">
                                                    {t("students.filters.description")}
                                                </p>
                                            </div>
                                            <div className="grid gap-2">
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.moduleCount")}</Label>
                                                    <Input
                                                        type={"number"}
                                                        id="width"
                                                        defaultValue="2"
                                                        className="col-span-2 h-8"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.grade")}</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={t("students.filters.gradePlaceholder")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>{t("students.filters.grade")}</SelectLabel>
                                                                {gradeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 items-center gap-4">
                                                    <Label>{t("students.filters.completion")}</Label>
                                                    <Slider/>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div>
                            <StudentCard/>
                            <StudentCard/>
                            <StudentCard/>
                            <StudentCard/>
                        </div>
                        <div className={"text-primary mt-6"}>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" size={"default"}/>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#" size={"default"}>1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationEllipsis/>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" size={"default"}/>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>
                <div className={"w-1/3 bg-gray-100 mt-6 flex flex-col gap-4 p-4 rounded-xl"}>
                    <Card>
                        <CardHeader className={"gap-0"}>
                            <H3 className={"text-left mb-0"}>{t("widgets.calendar.title")}</H3>
                            <P className={"text-xs mt-0"}>{t("widgets.calendar.subtitle")}</P>
                        </CardHeader>
                        <CardContent>
                            <Calendar className={"w-full"}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className={"gap-0"}>
                            <H3 className={"text-left mb-0"}>{t("widgets.upcoming.title")}</H3>
                            <P className={"text-xs mt-0"}>{t("widgets.upcoming.subtitle")}</P>
                        </CardHeader>
                        <CardContent className={"flex flex-col"}>
                            <UpcomingEvent/>
                            <UpcomingEvent/>
                            <UpcomingEvent/>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    )
}
