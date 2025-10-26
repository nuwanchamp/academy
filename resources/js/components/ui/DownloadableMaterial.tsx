import {LucideDownload, LucideFileQuestion} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";

type DownloadableMaterialProps = {
    name: string,
    link: string,
}

export default function DownloadableMaterial({name, link}: DownloadableMaterialProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className={"flex gap-1"}><LucideFileQuestion className={"text-primary group-hover:text-white"}/>
                <span>{name}</span>
            </div>

            <Button variant="ghost" className={"group hover:bg-primary hover:text-white"} onClick={() => {}}>
                <Link to={link} download><LucideDownload/></Link>
            </Button>
        </div>
    )
}
