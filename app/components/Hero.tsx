"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import GridOverlay from "./GridOverlay";
import { isUnoptimized, mediaUrl } from "@/app/lib/media";
import type { HomePage } from "@/payload-types";

// Text decode effect
function useDecodedText(finalText: string, delay = 0, duration = 1500) {
    const [displayText, setDisplayText] = useState(finalText);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame = 0;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            if (progress < 1) {
                const decodedLength = Math.floor(progress * finalText.length);
                let result = finalText.slice(0, decodedLength);

                for (let i = decodedLength; i < finalText.length; i++) {
                    if (finalText[i] === " ") {
                        result += " ";
                    } else {
                        result += chars[Math.floor(Math.random() * chars.length)];
                    }
                }

                setDisplayText(result);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayText(finalText);
            }
        };

        const timeout = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(animationFrame);
        };
    }, [finalText, delay, duration]);

    return displayText;
}

// Glitch effect component
function GlitchOverlay() {
    const [glitchActive, setGlitchActive] = useState(false);

    useEffect(() => {
        const triggerGlitch = () => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 100);
        };

        const interval = setInterval(() => {
            if (Math.random() > 0.85) triggerGlitch();
        }, 2000);

        // Initial glitch
        setTimeout(triggerGlitch, 3000);

        return () => clearInterval(interval);
    }, []);

    if (!glitchActive) return null;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(74,109,86,0.1)",
                mixBlendMode: "difference",
                pointerEvents: "none",
                zIndex: 5,
            }}
        />
    );
}

interface HeroProps {
    isMuted: boolean;
    volume: number;
    data: Pick<HomePage, "hero"> | null;
}

export default function Hero({ isMuted, volume, data }: HeroProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [heroHovered, setHeroHovered] = useState(false);

    const hero = data?.hero || {};
    const heading1 = hero.heading1 || "Join Khalai Makhlooq";
    const heading2 = hero.heading2 || "Rule the Stars";
    const description = hero.description || "Elite Star Citizen Org, laid-back scene";
    const ctaLink = hero.ctaLink || "https://discord.gg/kmhq";

    const sub1Normal = hero.subheading1Normal || "And, Welcome PvP";
    const sub1Hover = hero.subheading1Hover || "We Enjoy PvE";
    const sub2Normal = hero.subheading2Normal || "Also, Murder Hobos";
    const sub2Hover = hero.subheading2Hover || "Space Capitalists";
    const sub3Normal = hero.subheading3Normal || "Hide or Die";
    const sub3Hover = hero.subheading3Hover || "Deep Space Chilling";

    const backgroundVideoUrl = mediaUrl(hero.backgroundVideo) || "/hero-cinematic.mp4";
    const posterImageUrl = mediaUrl(hero.posterImage) || "/backgrounds/jp.jpg";
    const logoImageUrl = mediaUrl(hero.logoImage) || "/nobglogo.png";

    const decodedHeading1 = useDecodedText(heading1, 500, 600);
    const decodedHeading2 = useDecodedText(heading2, 700, 600);
    const decodedLabel = useDecodedText(
        heroHovered ? "Signal Shift: Full Throttle Mode" : description,
        heroHovered ? 0 : 400,
        heroHovered ? 250 : 400,
    );
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.volume = Math.max(0, Math.min(1, Math.pow(volume, 2)));
        }
    }, [isMuted, volume]);

    return (
        <section id="hero" className="hero-section" onMouseEnter={() => setHeroHovered(true)} onMouseLeave={() => setHeroHovered(false)}>
            <div className="hero-bg">
                <motion.video
                    ref={videoRef}
                    initial={{ scale: 1.1, filter: "brightness(0)" }}
                    animate={{ scale: 1, filter: "brightness(0.75)" }}
                    transition={{ duration: 2, ease: "circOut" }}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    preload="none"
                    poster={posterImageUrl}
                    className="h-full w-full object-cover"
                >
                    <source src={backgroundVideoUrl} type="video/mp4" />
                </motion.video>
                <GlitchOverlay />
            </div>

            <div className="hero-wrapper">
                <div className="hero-bottom">
                    <div className="hero-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="hero-label"
                        >
                            <span className="red-sq" />
                            <span className="hero-label-text">{decodedLabel}</span>
                            <a
                                href={ctaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="z-30 ml-3 animate-pulse cursor-pointer rounded border border-lime-300/30 bg-lime-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-lime-300 transition-all hover:border-lime-300 hover:bg-lime-300/20"
                            >
                                [ Connect ]
                            </a>
                        </motion.div>

                        <div className="hero-heading-wrapper">
                            <a
                                href="https://discord.gg/kmhq"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative z-20 block"
                            >
                                <motion.h1
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0, letterSpacing: heroHovered ? "-0.055em" : "-0.03em" }}
                                    transition={{ delay: 0.5, duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                    className="hero-heading text-glow flex items-center transition-all duration-300 group-hover:scale-[1.01] group-hover:text-lime-300"
                                >
                                    {decodedHeading1}
                                    <span className="ml-6 hidden translate-x-[-10px] rounded border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-mono text-sm uppercase tracking-[0.3em] text-lime-400/80 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:inline-block">
                                        Click Here
                                    </span>
                                </motion.h1>
                            </a>
                        </div>

                        <div className="hero-heading-wrapper">
                            <a
                                href="https://discord.gg/kmhq"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative z-20 block"
                            >
                                <motion.h1
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0, scale: heroHovered ? 1.025 : 1 }}
                                    transition={{ delay: 0.6, duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                    className="hero-heading accent text-glow flex items-center transition-all duration-300 group-hover:scale-[1.01] group-hover:text-lime-200"
                                    whileHover={{ scale: 1.05, skewX: -5 }}
                                >
                                    <Image
                                        src={logoImageUrl}
                                        alt="Khalai Makhlooq"
                                        width={168}
                                        height={168}
                                        loading="eager"
                                        unoptimized={isUnoptimized(logoImageUrl)}
                                        style={{
                                            display: "inline-block",
                                            width: "1.5em",
                                            height: "1.5em",
                                            verticalAlign: "middle",
                                            marginRight: "0.3em",
                                            filter: "drop-shadow(0 0 10px rgba(74, 109, 86, 0.4))",
                                        }}
                                    />
                                    {decodedHeading2}
                                </motion.h1>
                            </a>
                        </div>

                        <div className="hero-subheadings">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, color: heroHovered ? "#bef264" : undefined }}
                                transition={{ delay: 0.75, duration: 0.5 }}
                            >
                                {heroHovered ? sub1Hover : sub1Normal}
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, color: heroHovered ? "#a3e635" : undefined }}
                                transition={{ delay: 0.85, duration: 0.5 }}
                            >
                                {heroHovered ? sub2Hover : sub2Normal}
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, color: heroHovered ? "#84cc16" : undefined }}
                                transition={{ delay: 0.95, duration: 0.5 }}
                            >
                                {heroHovered ? sub3Hover : sub3Normal}
                            </motion.div>
                        </div>
                    </div>

                    <div className="hero-right">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.75, duration: 0.5 }}
                            className="scroll-indicator"
                        >
                            <span>++</span>
                            <span>scroll</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            <GridOverlay id="hero-grid" triggerSelector="#hero" />
        </section>
    );
}
