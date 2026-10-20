"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import Lenis from "lenis";
import { useLivePreview } from "@payloadcms/live-preview-react";
import { getServerUrl } from "@/app/lib/serverUrl";
import type { PageData } from "@/app/lib/payload/queries";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import AboutSkeleton from "@/app/components/AboutSkeleton";

const SectionSkeleton = () => (
    <div className="flex min-h-screen animate-pulse items-center justify-center bg-black">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
    </div>
);

// Below-the-fold sections load on demand
const Values = dynamic(() => import("@/app/components/Values"), { loading: SectionSkeleton });
const About = dynamic(() => import("@/app/components/About"), { loading: AboutSkeleton });
const Showcase = dynamic(() => import("@/app/components/Showcase"), { loading: SectionSkeleton });
const FAQ = dynamic(() => import("@/app/components/FAQ"), { loading: SectionSkeleton });

export type HomePageData = PageData<"home-page">;

export default function HomePageClient({ data: initialData }: { data: HomePageData | null }) {
    const { data } = useLivePreview<HomePageData>({
        initialData: initialData ?? ({} as HomePageData),
        serverURL: getServerUrl(),
        depth: 2,
    });

    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.2);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 0.9,
        });

        let rafId = 0;
        const raf = (time: number) => {
            if (!document.hidden) lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <AnimatePresence>
            <Header
                key="header"
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                volume={volume}
                setVolume={setVolume}
                siteSettings={data?.siteSettings}
            />

            <motion.main
                key="main"
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <Hero isMuted={isMuted} volume={volume} data={data} />
                <Values data={data?.values} />
                <About data={data?.about} />
                <Showcase data={data?.showcase} />
                <FAQ data={data?.faq} />
            </motion.main>
        </AnimatePresence>
    );
}
