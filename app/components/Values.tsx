"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { HomePage } from "@/payload-types";
import carrackBackground from "@/public/backgrounds/SC-4.0_20250220_164548_Carrack-Through-Clouds-Pyro-IV_f.png";
import clouds from "@/public/clouds.png";
import ship from "@/public/ship.png";
import rocks from "@/public/rocks.png";
import stones from "@/public/stones.png";

interface Narrative {
    id: string;
    subtitle: string;
    title: string[];
    desc: string;
}

// ── CSS keyframes injected once ──
const STYLES = `
  @keyframes rock-float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-7px); }
    100% { transform: translateY(0px); }
  }
  @keyframes rock-float-b {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  @keyframes white-flicker {
    0%, 90%, 92%, 94%, 96%, 98%, 100% { opacity: 0; }
    91%  { opacity: 0.06; }
    93%  { opacity: 0.03; }
    95%  { opacity: 0.08; }
    97%  { opacity: 0.02; }
  }
  @keyframes white-flicker-alt {
    0%, 85%, 87%, 89%, 91%, 93%, 100% { opacity: 0; }
    86%  { opacity: 0.04; }
    88%  { opacity: 0.07; }
    90%  { opacity: 0.02; }
    92%  { opacity: 0.05; }
  }
  @keyframes white-flicker-rare {
    0%, 95%, 97%, 99%, 100% { opacity: 0; }
    96%  { opacity: 0.1; }
    98%  { opacity: 0.03; }
  }
`;

// Default narratives used as fallback when no CMS data is available
const DEFAULT_NARRATIVES: Narrative[] = [
    {
        id: "intro",
        subtitle: "◈ STANTON SYSTEM — GRID REF 4.7 — KM-FLEET ACTIVE ◈",
        title: ["KMHQ", "Space Garage"],
        desc: "Big ships, loud engines, and a crew built for confident operations. In Stanton, KMHQ does not just arrive; it establishes presence.",
    },
    {
        id: "hammerhead",
        subtitle: "◈ FLEET DEFENSE — SQUADRON A ◈",
        title: ["The Shield"],
        desc: "The Hammerhead anchors convoy defense with layered firepower, screening hostile movement before it reaches the formation.",
    },
    {
        id: "carrack",
        subtitle: "◈ DEEP SPACE — EXPLORATION DIVISION ◈",
        title: ["The Unknown"],
        desc: "The Carrack pushes beyond mapped routes, turning unknown space into marked corridors and actionable intelligence.",
    },
    {
        id: "merchantman",
        subtitle: "◈ ECONOMIC DOMINANCE — LOGISTICS CORPS ◈",
        title: ["The Artery"],
        desc: "The Merchantman keeps the fleet economy moving, carrying cargo, resources, and influence through contested space.",
    },
    {
        id: "inferno",
        subtitle: "◈ STRIKE WING — HUNTER KILLERS ◈",
        title: ["The Fangs"],
        desc: "The Ares brings focused anti-capital pressure: one pilot, one heavy weapon, and no wasted intent.",
    },
    {
        id: "unity",
        subtitle: "◈ KHALAI MAKHLOOQ — UNIFIED COMMAND ◈",
        title: ["Together", "We Fly"],
        desc: "One crew, one fleet, one command signal. From MicroTech to Hurston, KMHQ moves with quiet authority.",
    },
];

const BACKGROUNDS = [carrackBackground];

function getBackgroundIndex(progress: number, total: number) {
    const index = Math.min(Math.floor(progress * total), total - 1);
    const segmentProgress = (progress * total) % 1;
    return { index, segmentProgress };
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function getNarrativeOpacity(progress: number, index: number, total: number) {
    const segmentSize = 1 / total;
    const start = index * segmentSize;
    const end = start + segmentSize;
    const fadeSize = segmentSize * 0.2;

    if (progress < start - fadeSize || progress > end) return 0;
    if (progress < start) return (progress - (start - fadeSize)) / fadeSize;
    if (progress > end - fadeSize) return (end - progress) / fadeSize;
    return 1;
}

export default function Values({ data }: { data?: HomePage["values"] }) {
    // Build narratives from CMS data or fall back to hardcoded defaults
    const NARRATIVES = useMemo<Narrative[]>(() => {
        if (data?.narratives?.length) {
            return data.narratives.map((n) => ({
                id: n.id || "",
                subtitle: n.subtitle || "",
                title: [n.title1, n.title2].filter((t): t is string => Boolean(t)),
                desc: n.desc || "",
            }));
        }
        return DEFAULT_NARRATIVES;
    }, [data]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!document.getElementById("parallax-styles")) {
            const el = document.createElement("style");
            el.id = "parallax-styles";
            el.textContent = STYLES;
            document.head.appendChild(el);
        }
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const onScroll = () => {
            const rect = wrapper.getBoundingClientRect();
            const wh = window.innerHeight;
            const total = wrapper.offsetHeight - wh;
            const scrolled = -rect.top;
            setProgress(Math.min(Math.max(scrolled / total, 0), 1));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const p = progress;
    const pO = easeOut(p);

    const bgScale = lerp(1, 1.18, p * 0.7);
    const cloudsScale = lerp(0.75, 1.35, pO);
    const cloudsY = lerp(8, -4, pO);
    const cloudsOp = Math.min(p * 2.2, 0.92);
    // Reduced parallax - rocks start closer to final position
    const rocksScale = lerp(0.85, 1.2, pO);
    const rocksY = lerp(2, -2, pO);
    const rocksOp = Math.min(p * 2, 1);

    // Background slideshow logic
    const { index: bgIndex, segmentProgress: bgSegment } = getBackgroundIndex(p, BACKGROUNDS.length);
    const nextBgIndex = Math.min(bgIndex + 1, BACKGROUNDS.length - 1);

    return (
        <div ref={wrapperRef} id="values" style={{ position: "relative", height: "350vh" }}>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    width: "100%",
                    overflow: "hidden",
                    background: "var(--bg)",
                }}
            >
                {/* ── Layer 1: Background slideshow — crossfading images ── */}
                {BACKGROUNDS.map((bg, i) => {
                    // Determine opacity based on current scroll position
                    let opacity = 0;
                    if (i === bgIndex) {
                        opacity = 1 - bgSegment * 0.5; // Start fading out halfway through segment
                    } else if (i === nextBgIndex && i !== bgIndex) {
                        opacity = bgSegment > 0.5 ? (bgSegment - 0.5) * 2 : 0; // Fade in second half
                    } else if (i === bgIndex - 1 && bgSegment < 0.5) {
                        opacity = 1 - bgSegment * 2; // Complete transition from previous
                    }

                    return (
                        <div
                            key={bg.src}
                            style={{
                                position: "absolute",
                                inset: "-5%",
                                zIndex: 1,
                                transform: `scale(${bgScale})`,
                                transformOrigin: "center 40%",
                                opacity: opacity,
                                transition: "opacity 0.8s ease-out",
                                willChange: "transform, opacity",
                            }}
                        >
                            <Image src={bg} alt="" fill sizes="110vw" style={{ objectFit: "cover" }} />
                        </div>
                    );
                })}

                {/* ── Layer 2: Clouds — scaled larger to hide edges ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-15%",
                        left: "-10%",
                        width: "120%",
                        zIndex: 3,
                        transform: `translateY(${cloudsY}%) scale(${cloudsScale})`,
                        transformOrigin: "bottom center",
                        opacity: cloudsOp,
                        willChange: "transform, opacity",
                        pointerEvents: "none",
                    }}
                >
                    <Image
                        src={clouds}
                        alt=""
                        sizes="120vw"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            mixBlendMode: "multiply",
                            filter: "brightness(1.1) saturate(1.3)",
                        }}
                    />
                </div>

                {/* ── Layer 2b: Ship — positioned between clouds and rocks ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "5%",
                        left: "5%",
                        width: "50%",
                        zIndex: 4,
                        transform: `translateY(${lerp(10, -5, pO)}%) scale(${lerp(0.85, 1.1, pO)}) rotate(${lerp(2, 0, pO)}deg)`,
                        transformOrigin: "center center",
                        opacity: lerp(0.8, 1, pO),
                        willChange: "transform, opacity",
                        pointerEvents: "none",
                    }}
                >
                    <Image
                        src={ship}
                        alt=""
                        sizes="50vw"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
                        }}
                    />
                </div>

                {/* ── Layer 3: Rocks — scaled larger to hide edges ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-20%",
                        left: "-10%",
                        width: "120%",
                        zIndex: 5,
                        transform: `translateY(${rocksY}%) scale(${rocksScale})`,
                        transformOrigin: "bottom center",
                        opacity: rocksOp,
                        willChange: "transform, opacity",
                        pointerEvents: "none",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ animation: "rock-float 4.8s ease-in-out infinite" }}>
                        <Image
                            src={rocks}
                            alt=""
                            sizes="120vw"
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                mixBlendMode: "multiply",
                                filter: "brightness(1.1) contrast(1.05)",
                            }}
                        />
                    </div>
                </div>

                {/* ── Layer 3b: Stones — scaled larger to hide edges ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-20%",
                        left: "-10%",
                        width: "120%",
                        zIndex: 4,
                        transform: `translateY(${rocksY * 0.5}%) scale(${lerp(0.65, 1.3, pO)})`,
                        transformOrigin: "bottom center",
                        opacity: lerp(0, 0.9, pO),
                        willChange: "transform, opacity",
                        pointerEvents: "none",
                    }}
                >
                    <div style={{ animation: "rock-float-b 6.2s ease-in-out infinite", animationDelay: "1s" }}>
                        <Image
                            src={stones}
                            alt=""
                            sizes="120vw"
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                mixBlendMode: "multiply",
                                filter: "brightness(1.05) contrast(1.1)",
                            }}
                        />
                    </div>
                </div>

                {/* ── Subtle dark gradient overlay ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 6,
                        background: "linear-gradient(180deg, rgba(10,15,20,0.3) 0%, transparent 60%)",
                        backdropFilter: `blur(${lerp(5, 0, p * 2)}px)`,
                        opacity: lerp(1, 0, p * 3),
                        pointerEvents: "none",
                        transition: "backdrop-filter 0.1s ease-out",
                    }}
                />

                {/* ── White Flicker Effects (replaced cartoon lightning) ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 6,
                        background: "white",
                        opacity: 0,
                        pointerEvents: "none",
                        mixBlendMode: "overlay",
                        animation: "white-flicker 4.2s ease-in-out infinite",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 6,
                        background: "white",
                        opacity: 0,
                        pointerEvents: "none",
                        mixBlendMode: "overlay",
                        animation: "white-flicker-alt 5.8s ease-in-out infinite",
                        animationDelay: "1.5s",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 6,
                        background: "white",
                        opacity: 0,
                        pointerEvents: "none",
                        mixBlendMode: "overlay",
                        animation: "white-flicker-rare 7.3s ease-in-out infinite",
                        animationDelay: "3s",
                    }}
                />

                {/* ── Vignette ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 7,
                        background: "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(4,1,4,0.45) 100%)",
                        pointerEvents: "none",
                    }}
                />

                {/* ── Scroll-Reactive Fleet Narrative ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        textAlign: "center",
                        padding: "0 32px",
                    }}
                >
                    {NARRATIVES.map((narrative, i) => {
                        const opacity = getNarrativeOpacity(p, i, NARRATIVES.length);
                        const yOffset = (1 - opacity) * 30;

                        return (
                            <motion.div
                                key={narrative.id}
                                style={{
                                    position: "absolute",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    opacity: opacity,
                                    transform: `translateY(${yOffset}px)`,
                                    transition: "opacity 0.4s ease, transform 0.4s ease",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "clamp(0.82rem, 1.05vw, 1.05rem)",
                                        letterSpacing: "0.24em",
                                        textTransform: "uppercase",
                                        color: "rgba(163,230,53,0.82)",
                                        marginBottom: "22px",
                                        fontWeight: 800,
                                    }}
                                >
                                    {narrative.subtitle}
                                </div>
                                <h2
                                    style={{
                                        fontFamily: "var(--font-heading)",
                                        fontWeight: 700,
                                        fontSize: "clamp(4.2rem, 10.5vw, 10.5rem)",
                                        lineHeight: 0.84,
                                        letterSpacing: "-0.075em",
                                        textTransform: "uppercase",
                                        color: "#fff",
                                        textShadow:
                                            i === NARRATIVES.length - 1
                                                ? "0 0 80px rgba(74,109,86,0.6), 0 0 30px rgba(74,109,86,0.3)"
                                                : "0 0 60px rgba(100,100,120,0.4), 0 0 20px rgba(74,109,86,0.2)",
                                        marginBottom: "28px",
                                    }}
                                >
                                    {narrative.title[0]}
                                    {narrative.title[1] && (
                                        <>
                                            <br />
                                            <span
                                                style={{ color: i === NARRATIVES.length - 1 ? "var(--accent)" : "rgba(200,200,210,0.9)" }}
                                            >
                                                {narrative.title[1]}
                                            </span>
                                        </>
                                    )}
                                </h2>
                                <p
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "clamp(1.05rem, 1.35vw, 1.45rem)",
                                        color: "rgba(238,242,249,0.78)",
                                        maxWidth: "780px",
                                        lineHeight: 1.55,
                                        fontWeight: 600,
                                    }}
                                >
                                    {narrative.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── HUD corner brackets ── */}
                {[
                    { top: "24px", left: "24px", borderTop: "1px solid", borderLeft: "1px solid" },
                    { top: "24px", right: "24px", borderTop: "1px solid", borderRight: "1px solid" },
                    { bottom: "24px", left: "24px", borderBottom: "1px solid", borderLeft: "1px solid" },
                    { bottom: "24px", right: "24px", borderBottom: "1px solid", borderRight: "1px solid" },
                ].map((s, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            zIndex: 9,
                            width: "28px",
                            height: "28px",
                            borderColor: "rgba(74,109,86,0.4)",
                            pointerEvents: "none",
                            ...s,
                        }}
                    />
                ))}

                {/* ── Scroll progress bar ── */}
                <div style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", zIndex: 9 }}>
                    <div style={{ width: "1px", height: "80px", background: "rgba(74,109,86,0.2)", position: "relative" }}>
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${p * 100}%`,
                                background: "var(--accent)",
                            }}
                        />
                    </div>
                </div>

                {/* ── Bottom fade ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "120px",
                        zIndex: 10,
                        background: "linear-gradient(to bottom, transparent, #05070A)",
                        pointerEvents: "none",
                    }}
                />
            </div>
        </div>
    );
}
