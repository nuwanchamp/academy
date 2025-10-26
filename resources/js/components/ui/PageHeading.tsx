import {P} from "@/components/ui/typography/P.tsx";
import {H2} from "@/components/ui/typography/h2.tsx";


type PageHeadingProps = {
    lead?: string;
    title: string;
}
export default function PageHeading({title, lead}: PageHeadingProps) {
    return (
        <div className={"flex flex-col text-left"}>
            <P className={"text-lg font-medium text-gray-500"}>{lead}</P>
            <H2 className={"text-left"}>{title}</H2>
        </div>
    )
}
