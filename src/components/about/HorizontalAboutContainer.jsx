"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

import { motion, useScroll, useSpring } from "motion/react";

export default function HorizontalAboutContainer({ children }) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        // ▸ Initialize Lenis for smooth scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // ▸ GSAP Horizontal Scroll Logic
        const sections = gsap.utils.toArray(".deck-section");

        let scrollTween = gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                pin: true,
                scrub: 1,
                snap: 1 / (sections.length - 1),
                // Base end on the amount of horizontal scroll
                end: () => `+=${containerRef.current.offsetWidth * (sections.length - 1)}`,
            },
        });

        return () => {
            lenis.destroy();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <div ref={containerRef} className="relative bg-black">
            <div ref={wrapperRef} className="flex flex-row w-fit h-screen items-stretch">
                {children}
            </div>

            {/* HUD Navigation Progress Bar */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-white/10 z-50 overflow-hidden">
                <motion.div className="h-full bg-emerald-500 origin-left" style={{ scaleX }} />
            </div>

            {/* Navigation Label */}
            <div className="fixed bottom-14 left-1/2 -translate-x-1/2 font-mono text-[8px] text-emerald-500/40 uppercase tracking-[0.3em] z-50">
                Navigating Hull Decks
            </div>
        </div>
    );
}
