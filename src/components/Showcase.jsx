"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Showcase({ data }) {
    // CMS-backed data with fallbacks
    const sectionLabel = data?.sectionLabel || "Operations Breakdown";
    const stackWords = data?.headlineWords?.map((w) => w.word) || data?.stackWords?.map((w) => w.text) || ["We", "Never", "Idle"];
    const overviewText =
        data?.overviewText ||
        "Khalai Makhlooq covers every angle of the Stanton system. Whether it is moving high-value cargo through contested space, recovering downed ships in hostile territory, or locking down an orbital station with overwhelming firepower—KMHQ is equipped, trained, and ready to deploy.";
    const metricsPanelBody =
        data?.metricsPanelBody ||
        "Every division has a simple rule: move fast, see first, and leave the battlefield so clean people ask who the cleanup crew was.";
    const pillarsHeading = data?.pillarsHeading || "Style under pressure.";
    const pillarsSubtext =
        data?.pillarsSubtext || "Fleet layout is simple: clear roles, wide space, and zero random button mashing. Just coordinated action.";

    const PILLARS = data?.pillars || [
        {
            code: "01",
            name: "Strike Mode",
            detail: "Target spotted, squad deployed, scene done. Clean pressure with no extra drama.",
        },
        {
            code: "02",
            name: "Cargo Chill",
            detail: "Boxes move and so do the vibes. Supply line strong, fleet well-stocked.",
        },
        {
            code: "03",
            name: "Recovery Ops",
            detail: "Ship down? No stress. Salvage, extract, rebuild, then back on the runway.",
        },
        {
            code: "04",
            name: "Deep Orbit",
            detail: "Map ends where KMHQ begins. Scout, mark, and plan the next move.",
        },
    ];

    const METRICS = data?.metrics || [
        { value: "2950", label: "Scene since" },
        { value: "6", label: "Big ships" },
        { value: "80+", label: "Active pilots" },
        { value: "24/7", label: "Hangar ready" },
    ];

    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                "[data-showcase-word]",
                { yPercent: 120, opacity: 0, rotateX: -40 },
                {
                    yPercent: 0,
                    opacity: 1,
                    rotateX: 0,
                    stagger: 0.05,
                    duration: 0.5,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 72%",
                    },
                },
            );

            gsap.fromTo(
                "[data-pillar-card]",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.05,
                    duration: 0.45,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: "[data-pillar-grid]",
                        start: "top 75%",
                    },
                },
            );

            gsap.to("[data-showcase-stack]", {
                y: -95,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.8,
                },
            });

            gsap.to("[data-metrics-panel]", {
                y: -64,
                scale: 1.025,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="showcase" ref={sectionRef} className="relative overflow-hidden bg-[#030603] py-28 text-white md:py-40">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-8%] top-[10%] h-[32rem] w-[32rem] rounded-full bg-lime-400/5 blur-[140px]" />
                <div className="absolute left-[-12%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-lime-500/5 blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(163,230,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.03)_1px,transparent_1px)] bg-[size:88px_88px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />
            </div>

            <div className="relative z-10 w-full px-3 sm:px-5 2xl:px-8">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-end">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <span className="h-2 w-2 rounded-sm bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.6)] animate-pulse" />
                            <span className="font-mono text-base font-bold uppercase tracking-[0.35em] text-lime-300/80">
                                {sectionLabel}
                            </span>
                        </div>

                        <div
                            data-showcase-stack
                            className="max-w-6xl font-black uppercase leading-[0.78] tracking-[-0.09em] text-white will-change-transform"
                        >
                            {stackWords.map((word) => (
                                <div key={word} className="overflow-hidden pb-4">
                                    <div
                                        data-showcase-word
                                        className="cursor-default text-[23vw] text-transparent [-webkit-text-stroke:1.3px_rgba(190,242,100,0.55)] md:text-[15vw] lg:text-[10.5vw] transition-all duration-500 hover:text-lime-300 hover:[-webkit-text-stroke:2px_transparent] hover:-skew-x-6 hover:scale-[1.02] hover:drop-shadow-[0_0_30px_rgba(163,230,53,0.5)]"
                                    >
                                        {word}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        data-metrics-panel
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="rounded-[2.5rem] border border-lime-300/15 bg-[#08120a] p-8 backdrop-blur-2xl ring-1 ring-white/5"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            {METRICS.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="group relative overflow-hidden rounded-2xl border border-lime-300/10 bg-black/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-lime-300/30 hover:bg-lime-300/[0.04]"
                                >
                                    <div className="absolute -inset-x-4 -top-4 h-12 bg-gradient-to-b from-lime-300/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="font-mono text-sm uppercase tracking-[0.3em] text-lime-300/60 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-lime-300">
                                            {metric.label}
                                        </span>
                                        <span className="font-mono text-lg text-lime-300/0 transition-all duration-300 group-hover:text-lime-300/50 group-hover:-translate-x-2">
                                            &rarr;
                                        </span>
                                    </div>
                                    <div className="relative z-10 mt-4 text-5xl font-semibold tracking-[-0.06em] text-white md:text-6xl transition-transform duration-300 group-hover:translate-x-2">
                                        {metric.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-7 max-w-2xl text-2xl leading-10 text-white/48">{metricsPanelBody}</p>
                    </motion.div>
                </div>

                <div className="mt-16 border-t border-lime-300/15 pt-12">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <h2 className="text-5xl font-bold tracking-[-0.07em] md:text-7xl">{pillarsHeading}</h2>
                        <p className="max-w-2xl text-xl leading-9 text-white/48">{pillarsSubtext}</p>
                    </div>

                    <div data-pillar-grid className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {PILLARS.map((pillar) => (
                            <div
                                key={pillar.code}
                                data-pillar-card
                                className="group relative overflow-hidden rounded-[2rem] border border-lime-300/10 bg-gradient-to-b from-[#08120a] to-black p-8 transition-all duration-500 hover:-translate-y-2 hover:border-lime-300/30"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.08),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="relative z-10 flex items-start justify-between gap-4">
                                    <span className="font-mono text-sm uppercase tracking-[0.3em] text-lime-300/60 transition-colors group-hover:text-lime-300">
                                        {pillar.code}
                                    </span>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-lime-300/20 bg-lime-300/5 transition-transform duration-500 group-hover:rotate-45 group-hover:border-lime-300/50 group-hover:bg-lime-300/20">
                                        <span className="h-1.5 w-1.5 rounded-full bg-lime-400 opacity-60" />
                                    </div>
                                </div>
                                <h3 className="mt-16 text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{pillar.name}</h3>
                                <p className="mt-6 text-lg leading-8 text-white/45">{pillar.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
