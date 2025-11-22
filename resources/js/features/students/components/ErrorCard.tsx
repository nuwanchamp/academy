import {Card, CardContent, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

type ErrorCardProps = {
    title?: string;
    message: string;
    onRetry?: () => void;
};

export const ErrorCard = ({title = "Something went wrong", message, onRetry}: ErrorCardProps) => (
    <Card className="border-destructive/30 bg-destructive/5">
        <CardContent role="alert" className="flex flex-col gap-3 py-8 text-center">
            <CardTitle className="text-destructive">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{message}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </CardContent>
    </Card>
);
