import {Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item.tsx";
import {LucideCheckCircle, LucideFolders} from "lucide-react";
import {H4} from "@/components/ui/typography/h4.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ComponentPropsWithoutRef} from "react";
import {Link} from "react-router-dom";

type StudentModuleItemProps =  ComponentPropsWithoutRef<"div"> & {
    name: string,
    description: string,
    status: "completed" | "active",
    id: string,
}


export default function StudentModuleItem({name, description, status, id}: StudentModuleItemProps) {

    const itemVariant = status === "completed" ? "muted" : "outline"

    return (
        <Item variant={itemVariant} className={"text-primary w-full"}>
            <ItemMedia variant="icon">
                <LucideFolders/>
            </ItemMedia>
            <ItemContent>
                <ItemTitle><H4>{name}</H4></ItemTitle>
                <ItemDescription>
                    {description}
                    <div className={"mt-2"}>
                        <span>
                            <Badge variant={status==='completed'?"outline":"default"}><LucideCheckCircle width={16}
                                                      className={"mr-2"}/>{status}</Badge>
                        </span>
                    </div>
                </ItemDescription>

            </ItemContent>
            <ItemActions>
                <Button size="sm" variant="outline">
                    <Link to={`/modules/${id}`}>
                        Review
                    </Link>
                </Button>
            </ItemActions>
        </Item>
    )
}
