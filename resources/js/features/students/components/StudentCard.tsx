import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Link} from "react-router-dom";
import type {StudentListItem} from "@/features/students/types/student";

type StudentCardProps = {
    student: StudentListItem;
    statusTone: Record<string, "default" | "secondary" | "outline">;
    formatDate: (value?: string | null) => string;
};

export const StudentCard = ({student, statusTone, formatDate}: StudentCardProps) => (
    <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">
                        {student.first_name} {student.last_name}
                        {student.preferred_name && <span className="text-muted-foreground"> ({student.preferred_name})</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{student.grade ?? "Grade TBD"}</Badge>
                        <span>DOB · {formatDate(student.date_of_birth)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={statusTone[(student.status ?? "").toLowerCase()] ?? "outline"}>
                        {student.status ?? "Not set"}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Quick summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Keeping {student.first_name}’s plan aligned with grade expectations and weekly routines. Track new
                        diagnostics from the edit page.
                    </p>
                </div>
                <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Actions
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="link" size="sm" className="px-0 text-primary">
                            <Link to={`/students/${student.id}`}>Open profile</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/students/${student.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);
