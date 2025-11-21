import {useCallback, useState} from "react";
import type {FormEvent} from "react";
import {ZodError} from "zod";

import {authApi} from "@/features/auth/services/authApi.ts";
import {useAuthStore} from "@/features/auth/store/useAuthStore.ts";
import type {Credentials, LoginFeedback, LoginResponse} from "@/features/auth/types/auth";
import {summarizeError} from "@/lib/summarizeError";

type UseLoginOptions = {
    onSuccess?: (response: LoginResponse) => void;
};

export const useLogin = ({onSuccess}: UseLoginOptions = {}) => {
    const [credentials, setCredentials] = useState<Credentials>({identifier: "", password: ""});
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginFeedback, setLoginFeedback] = useState<LoginFeedback | null>(null);
    const setSession = useAuthStore((state) => state.setSession);

    const submit = useCallback(async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setIsLoggingIn(true);
        setLoginFeedback(null);

        try {
            const data = await authApi.login(credentials);
            setSession(data);
            const friendlyName = (data.user?.name || data.user?.email || "there").split(" ")[0];
            setLoginFeedback({type: "success", message: `Welcome back, ${friendlyName}!`});
            onSuccess?.(data);
        } catch (error) {
            const message = error instanceof ZodError
                ? error.issues[0]?.message ?? "Please check your credentials."
                : summarizeError(error);
            setLoginFeedback({type: "error", message});
        } finally {
            setIsLoggingIn(false);
        }
    }, [credentials, onSuccess, setSession]);

    return {
        credentials,
        setCredentials,
        submit,
        isLoggingIn,
        loginFeedback,
    };
};

