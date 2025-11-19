import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {ArrowLeft, ArrowRight, Loader2, Lock, Mail} from "lucide-react";
import axios from "axios";

import {Logo} from "@/components/ui/Logo.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {H1} from "@/components/ui/typography/h1.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";


const factSlides = [
    {
        heading: "Built for inclusive classrooms",
        copy: "Learning paths, sensory notes, and caregiver updates all live inside the same modular dashboard.",
        stat: "42 modular paths live",
        accent: "from-violet-500 via-fuchsia-500 to-orange-400",
    },
    {
        heading: "Realtime progress insights",
        copy: "Teachers log observations once and see them flow into cohort heatmaps and family-ready reports.",
        stat: "860+ insights shared",
        accent: "from-sky-500 via-cyan-400 to-emerald-400",
    },
    {
        heading: "Parent portal in sync",
        copy: "Role-aware access with bilingual copy means updates feel consistent for every caregiver.",
        stat: "7k secure sessions",
        accent: "from-amber-500 via-rose-500 to-purple-500",
    },
];

const Home: React.FC = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [credentials, setCredentials] = useState({identifier: "", password: ""});
    const [loginFeedback, setLoginFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotFeedback, setForgotFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSendingLink, setIsSendingLink] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % factSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (direction: "next" | "prev") => {
        setActiveSlide((prev) =>
            direction === "next"
                ? (prev + 1) % factSlides.length
                : (prev - 1 + factSlides.length) % factSlides.length
        );
    };

    const summarizeError = (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            const responseMessage = error.response?.data?.message;
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                const firstKey = Object.keys(validationErrors)[0];
                if (firstKey) {
                    return validationErrors[firstKey][0];
                }
            }

            if (typeof responseMessage === "string") {
                return responseMessage;
            }
        }

        return "Something went wrong. Please try again.";
    };

    const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoggingIn(true);
        setLoginFeedback(null);

        try {
            const {data} = await axios.post("/api/v1/login", credentials);
            localStorage.setItem("rr_token", data.token);
            if (data.user) {
                localStorage.setItem("rr_user", JSON.stringify(data.user));
            }
            const friendlyName = (data.user?.name || data.user?.email || "there").split(" ")[0];
            setLoginFeedback({type: "success", message: `Welcome back, ${friendlyName}!`});
            navigate('/dashboard');

        } catch (error) {
            debugger;
            setLoginFeedback({type: "error", message: summarizeError(error)});
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleForgotSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSendingLink(true);
        setForgotFeedback(null);

        try {
            const effectiveEmail = forgotEmail || (credentials.identifier.includes('@') ? credentials.identifier : "");

            if (! effectiveEmail) {
                setForgotFeedback({type: "error", message: "Please enter an email address."});
                return;
            }

            await axios.post("/api/v1/password/forgot", {
                email: effectiveEmail,
            });
            setForgotFeedback({type: "success", message: "Reset link on its way to your inbox."});
        } catch (error) {
            setForgotFeedback({type: "error", message: summarizeError(error)});
        } finally {
            setIsSendingLink(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full lg:flex">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                <div className="absolute inset-0 translate-y-8 rounded-full bg-primary/20 blur-3xl opacity-40"/>
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/40 bg-white/95 shadow-[0_20px_60px_rgba(79,70,229,0.35)] backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
                    <Logo className="h-24 w-auto text-slate-900 dark:text-white"/>
                </div>
            </div>
            <section className="flex w-full flex-col justify-center bg-white px-6 py-12 dark:bg-slate-950 lg:order-2 lg:w-1/2 lg:px-14">
                <div className="mx-auto w-full max-w-md space-y-10">
                    <div className="space-y-3 text-left">
                        <Logo className="h-10 w-auto lg:hidden"/>
                        <P className=" text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Welcome back
                        </P>
                    </div>
                    <Card className="border-slate-200/80 shadow-lg dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-left text-2xl text-slate-900 dark:text-white">Account access</CardTitle>
                            <P className="text-left text-sm text-slate-500 dark:text-slate-300">
                                We’ll never share your credentials. Need an account? <Link to="/register" className="text-primary underline">Create one</Link>.
                            </P>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={handleLoginSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="identifier" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Email or username
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                                        <Input
                                            id="identifier"
                                            type="text"
                                            placeholder="you@rainbowroots.school or MsRivera"
                                            className="pl-10"
                                            value={credentials.identifier}
                                            onChange={(event) => setCredentials((prev) => ({...prev, identifier: event.target.value}))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Password</Label>
                                        <button
                                            type="button"
                                            className="text-primary transition hover:text-primary/80"
                                            onClick={() => setForgotOpen((prev) => !prev)}
                                        >
                                            Forgot?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={credentials.password}
                                            onChange={(event) => setCredentials((prev) => ({...prev, password: event.target.value}))}
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

                            {forgotOpen && (
                                <div className="mt-8 border-t border-dashed border-slate-200 pt-6 dark:border-slate-800">
                                    <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Need a reset link? We’ll email it to you.
                                    </p>
                                    <form className="space-y-4" onSubmit={handleForgotSubmit}>
                                        <div className="space-y-2">
                                            <Label htmlFor="forgot-email" className="text-sm font-medium text-slate-600 dark:text-slate-200">
                                                Email address
                                            </Label>
                                            <Input
                                                id="forgot-email"
                                                type="email"
                                                placeholder="you@rainbowroots.school"
                                                value={forgotEmail}
                                                onChange={(event) => setForgotEmail(event.target.value)}
                                                required={!credentials.identifier.includes('@')}
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
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="relative hidden w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-12 text-white lg:order-1 lg:flex lg:w-1/2 lg:px-14">
                <div className="absolute inset-0">
                    <div className="absolute inset-x-0 top-20 h-64 bg-gradient-to-r from-primary/20 via-fuchsia-300/20 to-amber-200/20 blur-3xl"/>
                    {/*<img src={heroIllustration} alt="Students" className="absolute bottom-6 right-8 h-24 opacity-50"/>*/}
                </div>
                <div className="relative z-10 flex w-full max-w-xl flex-col gap-8">
                    <div className="space-y-4 text-left">
                        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/80">Rainbow Roots</p>
                        <H1 className="text-left text-4xl leading-tight text-white">
                            Nurturing progress with real-time insight.
                        </H1>
                        <P className="text-base text-white/90 max-w-lg">
                            The welcome space mirrors the dashboard’s energy—bold gradients, micro-interactions, and data that proves every note matters.
                        </P>
                    </div>
                    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Inside the platform</p>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => goToSlide("prev")}>
                                    <ArrowLeft className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => goToSlide("next")}>
                                    <ArrowRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-6 space-y-6">
                            <div className={`rounded-2xl bg-gradient-to-r ${factSlides[activeSlide].accent} p-5 text-white shadow-lg`}>
                                <p className="text-sm uppercase tracking-[0.4em] text-white/70">Features</p>
                                <p className="mt-3 text-2xl font-semibold">{factSlides[activeSlide].heading}</p>
                                <p className="mt-2 text-sm leading-relaxed text-white/90">{factSlides[activeSlide].copy}</p>
                                <p className="mt-4 text-base font-semibold">{factSlides[activeSlide].stat}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {factSlides.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveSlide(index)}
                                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-white" : "w-3 bg-white/40"}`}
                                        aria-label={`Go to fact ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
