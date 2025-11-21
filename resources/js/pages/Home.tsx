import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft, ArrowRight} from "lucide-react";

import {Logo} from "@/components/ui/Logo.tsx";
import {Button} from "@/components/ui/button.tsx";
import {H1} from "@/components/ui/typography/h1.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import LoginForm from "@/features/auth/components/LoginForm.tsx";


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
    const navigate = useNavigate();
    const handleLoginSuccess = useCallback(() => {
        navigate("/dashboard");
    }, [navigate]);

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

    return (
        <div className="relative min-h-screen w-full lg:flex">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                <div className="absolute inset-0 translate-y-8 rounded-full bg-primary/20 blur-3xl opacity-40"/>
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/40 bg-white/95 shadow-[0_20px_60px_rgba(79,70,229,0.35)] backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/85">
                    <Logo className="h-24 w-auto text-slate-900 dark:text-white"/>
                </div>
            </div>
            <section className="flex w-full flex-col justify-center bg-white px-6 py-12 dark:bg-slate-950 lg:order-2 lg:w-1/2 lg:px-14">
                <LoginForm onLoginSuccess={handleLoginSuccess}/>
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
