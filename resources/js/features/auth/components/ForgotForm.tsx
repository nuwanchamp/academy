import {Loader2} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import useForgot from "@/features/auth/hooks/useForgot.ts";

type ForgotFormProps = {
    identifier: string;
};
const ForgotForm = ({identifier}:ForgotFormProps) => {
    const {
        forgotOpen,
        submit,
        forgotEmail,
        setForgotEmail,
        forgotFeedback,
        isSendingLink,
    } = useForgot();

    return forgotOpen && (
        <div className="mt-8 border-t border-dashed border-slate-200 pt-6 dark:border-slate-800">
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                Need a reset link? We’ll email it to you.
            </p>
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="forgot-email"
                           className="text-sm font-medium text-slate-600 dark:text-slate-200">
                        Email address
                    </Label>
                    <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@rainbowroots.school"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        required={!identifier.includes('@')}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        We’ll use this email if it’s different from the login form above.
                    </p>
                </div>

                {forgotFeedback && (
                    <div
                        className={`rounded-md border px-3 py-2 text-sm ${forgotFeedback.type === "success" ? "border-blue-300 bg-blue-50 text-blue-800" : "border-rose-300 bg-rose-50 text-rose-700"}`}
                        role="alert"
                    >
                        {forgotFeedback.message}
                    </div>
                )}

                <Button type="submit" variant="outline" className="w-full" disabled={isSendingLink}>
                    {isSendingLink ? (
                        <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                                    Sending…
                                                </span>
                    ) : (
                        "Email me a reset link"
                    )}
                </Button>
            </form>
        </div>
    )
}

export default ForgotForm;
