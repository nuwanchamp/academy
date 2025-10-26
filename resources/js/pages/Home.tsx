import React from 'react';
import {H1} from "@/components/ui/typography/h1.tsx";
import {P} from "@/components/ui/typography/P.tsx";
import {Logo} from "@/components/ui/Logo.tsx";

const Home: React.FC = () => {
    return (
        <div className={"container-fluid"}>
            <div className={"min-h-screen min-w-screen items-center justify-center flex"}>
                <div>
                    <Logo className={"mx-auto mb-4  "}/>
                    <H1 className={"text-shadow text-left rainbow-text uppercase tracking-wide"}>Rainbow Roots
                        Academy</H1>
                    <P className={"text-center uppercase tracking-wider mt-1 text-gray-500"}>Every child shines in their
                        own way</P>
                </div>
            </div>
        </div>
    );
}

export default Home;
