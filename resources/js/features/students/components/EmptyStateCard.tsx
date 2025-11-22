import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";

type EmptyStateCardProps = {
    title: string;
    description: string;
    cta?: {label: string; to: string};
};

export const EmptyStateCard = ({title, description, cta}: EmptyStateCardProps) => (
    <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            <p className="max-w-md text-sm leading-relaxed">{description}</p>
            {cta && (
                <Button asChild>
                    <Link to={cta.to}>{cta.label}</Link>
                </Button>
            )}
        </CardContent>
    </Card>
);
