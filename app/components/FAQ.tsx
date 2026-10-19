"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomePage } from "@/payload-types";

type FaqEntry = { q?: string | null; a?: string | null };

gsap.registerPlugin(ScrollTrigger);

const faqs: FaqEntry[] = [
    {
        q: "How do I join KMHQ?",
        a: "Come to Discord, get your handle verified, then you get listed on the roster. Simple process. We will see your playstyle and slot you into the wing that fits best.",
    },
    {
        q: "I am a new pilot — will I get help?",
        a: "Absolutely. Escorts, crewed ships, fleet support — all available. We have no interest in leaving anyone stranded in the menu.",
    },
    {
        q: "What actually happens in KMHQ?",
        a: "Combat patrol, convoy security, recon, cargo, salvage, deep-space staging. Sometimes a serious op, sometimes full hangar fun. But coordination is always tight.",
    },
    {
        q: "Is it casual or serious?",
        a: "The perfect mix of both. We keep a chill vibe, but once an op starts, comms tighten and the fleet becomes one unit.",
    },
    {
        q: "What makes KMHQ special?",
        a: "Less noise, more coordination. When everyone understands the same plan, even a small fleet looks cinematic.",
    },
];

interface FAQItemProps {
    faq: FaqEntry;
    index: number;
    isOpen: boolean;
    onClick: () => void;
}

function FAQItem({ faq, index, isOpen, onClick }: FAQItemProps) {
    return (
        <motion.div
            data-faq-card
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: index * 0.06, ease: "easeOut" }}
            className={`group relative overflow-hidden rounded-[1.75rem] border transition-all duration-300 ${
                isOpen
                    ? "border-lime-300/35 bg-lime-300/[0.075]"
                    : "border-lime-300/12 bg-white/[0.025] hover:border-lime-300/28 hover:bg-lime-300/[0.045] hover:translate-x-2"
            }`}
        >
            <button
                type="button"
                onClick={onClick}
                className="relative z-10 grid w-full gap-5 p-6 text-left md:grid-cols-[120px_minmax(0,1fr)_56px] md:items-center md:p-8"
            >
                <div className="font-mono text-base font-bold uppercase tracking-[0.34em] text-lime-300/55 group-hover:text-lime-300 transition-colors">
                    Q-{String(index + 1).padStart(2, "0")}
                </div>
                <div className="text-3xl font-semibold leading-none tracking-[-0.055em] text-white md:text-5xl">{faq.q}</div>
                <div
                    className={`ml-auto flex h-12 w-12 items-center justify-center rounded-full border font-mono text-2xl transition-all duration-300 ${
                        isOpen
                            ? "rotate-45 border-lime-300/50 bg-lime-300 text-[#061006]"
                            : "border-lime-300/20 text-lime-300/75 group-hover:border-lime-300/50 group-hover:bg-lime-300/10 group-hover:rotate-90"
                    }`}
                >
                    +
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative z-10 overflow-hidden"
                    >
                        <div className="border-t border-lime-300/10 px-6 pb-8 pt-6 md:ml-[120px] md:px-8">
                            <div className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.28em] text-lime-300/55">
                                Direct Answer
                            </div>
                            <p className="max-w-4xl text-xl leading-9 text-white/55 md:text-2xl md:leading-10">{faq.a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-lime-300/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.05),transparent_50%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
        </motion.div>
    );
}

export default function FAQ({ data }: { data?: HomePage["faq"] }) {
    const sectionLabel = data?.sectionLabel || "Quick Q&A";
    const headlineLines = data?.headlineLines?.map((l) => l.text) || ["Straight", "Answers"];
    const description =
        data?.description ||
        "Toss your confusion out the airlock. Ask the question, get the answer, then head back to the hangar for more fun.";
    const searchPlaceholder = data?.searchPlaceholder || "Search a question...";
    const noResultsText = data?.noResultsText || "No matching answers found — try checking the spelling";
    const questionsList: FaqEntry[] = data?.questions || faqs;

    const sectionRef = useRef<HTMLElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFaqs = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return questionsList;
        return questionsList.filter((faq) => `${faq.q} ${faq.a}`.toLowerCase().includes(term));
    }, [searchTerm, questionsList]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                "[data-faq-title]",
                { yPercent: 105, opacity: 0, rotateX: -35 },
                {
                    yPercent: 0,
                    opacity: 1,
                    rotateX: 0,
                    stagger: 0.1,
                    duration: 1,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 72%",
                    },
                },
            );

            gsap.to("[data-faq-title-stack]", {
                y: -70,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.9,
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="faq" ref={sectionRef} className="relative overflow-hidden bg-[#040704] py-28 text-white md:py-40">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-6%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-lime-400/10 blur-[140px]" />
                <div className="absolute left-[-10%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(163,230,53,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.035)_1px,transparent_1px)] bg-[size:80px_80px] opacity-45 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
            </div>

            <div className="relative z-10 w-full px-3 sm:px-5 2xl:px-8">
                <div className="mb-14 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)] lg:items-end">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <span className="h-2 w-2 rounded-sm bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.8)]" />
                            <span className="font-mono text-base font-bold uppercase tracking-[0.35em] text-lime-300/80">
                                {sectionLabel}
                            </span>
                        </div>
                        <div data-faq-title-stack className="font-black uppercase leading-[0.78] tracking-[-0.09em] will-change-transform">
                            {headlineLines.map((line) => (
                                <div key={line} className="overflow-hidden pb-4">
                                    <div
                                        data-faq-title
                                        className="cursor-default text-[22vw] text-transparent [-webkit-text-stroke:1.3px_rgba(190,242,100,0.55)] md:text-[14vw] lg:text-[10vw] transition-all duration-500 hover:text-lime-300 hover:[-webkit-text-stroke:2px_transparent] hover:-skew-x-6 hover:scale-[1.02] hover:drop-shadow-[0_0_30px_rgba(163,230,53,0.5)]"
                                    >
                                        {line}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-lime-300/15 bg-white/[0.035] p-6 backdrop-blur-xl">
                        <p className="text-2xl leading-10 text-white/50">{description}</p>
                        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-lime-300/15 bg-black/35 px-5 py-4">
                            <span className="font-mono text-lg text-lime-300/70">&gt;_</span>
                            <input
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setOpenIndex(0);
                                }}
                                placeholder={searchPlaceholder}
                                className="min-w-0 flex-1 bg-transparent text-xl text-white outline-none placeholder:text-white/25"
                            />
                            <span className="font-mono text-sm uppercase tracking-[0.22em] text-lime-300/45">
                                {filteredFaqs.length} answers
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                        <FAQItem
                            key={faq.q}
                            faq={faq}
                            index={index}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {filteredFaqs.length === 0 && (
                    <div className="rounded-[1.75rem] border border-lime-300/12 bg-white/[0.025] p-10 text-center font-mono text-lg uppercase tracking-[0.24em] text-white/35">
                        {noResultsText}
                    </div>
                )}
            </div>
        </section>
    );
}
