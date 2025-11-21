import {useCallback, useState} from "react";
import type {FormEvent} from "react";

import type {ForgotFeedback} from "@/features/auth/types/auth";
import {authApi} from "@/features/auth/services/authApi.ts";
import {useForgotStore} from "@/features/auth/store/useForgotStore.ts";
import {summarizeError} from "@/lib/summarizeError";

type UseForgotOptions = {
    getIdentifier?: () => string;
};

const useForgot = ({getIdentifier}: UseForgotOptions = {}) => {
    const {forgotOpen, toggleForgot} = useForgotStore();
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSendingLink, setIsSendingLink] = useState(false);
    const [forgotFeedback, setForgotFeedback] = useState<ForgotFeedback | null>(null);


    const submit = useCallback(async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setForgotFeedback(null);

        const fallbackEmail = getIdentifier?.() ?? "";
        const effectiveEmail = forgotEmail || fallbackEmail;

        if (!effectiveEmail) {
            setForgotFeedback({type: "error", message: "Please enter an email address."});
            return;
        }

        setIsSendingLink(true);

        try {
            await authApi.requestPasswordReset(effectiveEmail);
            setForgotFeedback({type: "success", message: "Reset link on its way to your inbox."});
        } catch (error) {
            setForgotFeedback({type: "error", message: summarizeError(error)});
        } finally {
            setIsSendingLink(false);
        }
    }, [forgotEmail, getIdentifier]);

    return {
        forgotOpen,
        toggleForgot,
        submit,
        forgotEmail,
        setForgotEmail,
        forgotFeedback,
        isSendingLink,
    };
};

export default useForgot;
