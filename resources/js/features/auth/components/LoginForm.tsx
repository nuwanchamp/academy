import React from "react";
import {Loader2, Lock, Mail} from "lucide-react";
import {Link} from "react-router-dom";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Logo} from "@/components/ui/Logo.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import ForgotForm from "@/features/auth/components/ForgotForm.tsx";
import {useLogin} from "@/features/auth/hooks/useLogin.ts";
import type {LoginResponse} from "@/features/auth/types/auth";
import {useForgotStore} from "@/features/auth/store/useForgotStore.ts";

type LoginFormProps = {
    onLoginSuccess?: (response: LoginResponse) => void;
};

type LoginFormComponent = React.FC<LoginFormProps> & {
    ForgotForm: typeof ForgotForm;
};

const LoginForm: LoginFormComponent = ({onLoginSuccess}) => {
    const {
        credentials,
        setCredentials,
        submit: handleLoginSubmit,
        isLoggingIn,
        loginFeedback,
    } = useLogin({onSuccess: onLoginSuccess});
    const {toggleForgot} = useForgotStore();

    return (
        <>
            <div className="mx-auto w-full max-w-md space-y-10">
                <div className="space-y-3 text-left">
                    <Logo className="h-10 w-auto lg:hidden"/>
                    <P className=" text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                        Welcome back
                    </P>
                </div>
                <Card className="border-slate-200/80 shadow-lg dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-left text-2xl text-slate-900 dark:text-white">Account
                            access</CardTitle>
                        <P className="text-left text-sm text-slate-500 dark:text-slate-300">
                            We’ll never share your credentials. Need an account? <Link to="/register"
                                                                                       className="text-primary underline">Create
                            one</Link>.
                        </P>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleLoginSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="identifier"
                                       className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Email or username
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="you@rainbowroots.school or MsRivera"
                                        className="pl-10"
                                        value={credentials.identifier}
                                        onChange={(event) => setCredentials((prev:any) => ({
                                            ...prev,
                                            identifier: event.target.value,
                                        }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <Label htmlFor="password"
                                           className="text-slate-700 dark:text-slate-200">Password</Label>
                                    <button
                                        type="button"
                                        className="text-primary transition hover:text-primary/80 cursor-pointer"
                                        onClick={toggleForgot}
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={credentials.password}
                                        onChange={(event) => setCredentials((prev:any) => ({
                                            ...prev,
                                            password: event.target.value,
                                        }))}
                                        required
                                    />
                                </div>
                            </div>

                            {loginFeedback && (
                                <div
                                    className={`rounded-md border px-3 py-2 text-sm ${loginFeedback.type === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-700"}`}
                                    role="alert"
                                >
                                    {loginFeedback.message}
                                </div>
                            )}

                            <Button size="lg" className="w-full text-base" type="submit" disabled={isLoggingIn}>
                                {isLoggingIn ? (
                                    <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                            Signing in…
                                        </span>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                            <div className="text-center text-sm text-slate-500 dark:text-slate-300">
                                By continuing you agree to the{" "}
                                <a href="#" className="text-primary underline underline-offset-4">usage policy</a>.
                            </div>
                        </form>

                        <LoginForm.ForgotForm
                            identifier={credentials.identifier}
                        />

                    </CardContent>
                </Card>
            </div>
        </>
    );
};

LoginForm.ForgotForm = ForgotForm;

export default LoginForm;

