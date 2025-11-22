import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";

type LoadingCardProps = {
    title?: string;
    description?: string;
};

export const LoadingCard = ({title = "Loading…", description}: LoadingCardProps) => (
    <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            {description && <p className="text-sm">{description}</p>}
        </CardContent>
    </Card>
);
