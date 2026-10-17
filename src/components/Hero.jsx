"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import GridOverlay from "./GridOverlay";

// Text decode effect
function useDecodedText(finalText, delay = 0, duration = 1500) {
    const [displayText, setDisplayText] = useState(finalText);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        const animate = (timestamp) => {
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

export default function Hero({ isMuted, volume, data }) {
    const videoRef = useRef(null);
    const [heroHovered, setHeroHovered] = useState(false);

    // Support both old Sanity format and new Payload format with fallbacks
    const hero = data?.hero || {};
    const heading1 = hero.heading1 || data?.heroHeading?.split(" | ")?.[0] || "Join Khalai Makhlooq";
    const heading2 = hero.heading2 || data?.heroHeading?.split(" | ")?.[1] || "Rule the Stars";
    const description = hero.description || data?.heroDescription || "Elite Star Citizen Org, laid-back scene";
    const ctaText = hero.ctaText || data?.ctaText || "Click Here to Join Discord";
    const ctaLink = hero.ctaLink || data?.ctaLink || "https://discord.gg/kmhq";

    const sub1Normal = hero.subheading1Normal || "And, Welcome PvP";
    const sub1Hover = hero.subheading1Hover || "We Enjoy PvE";
    const sub2Normal = hero.subheading2Normal || "Also, Murder Hobos";
    const sub2Hover = hero.subheading2Hover || "Space Capitalists";
    const sub3Normal = hero.subheading3Normal || "Hide or Die";
    const sub3Hover = hero.subheading3Hover || "Deep Space Chilling";

    const backgroundVideoUrl = hero.backgroundVideo?.url || "/Fight space and ground  Star Citizen epic cinematic,   Lighthouse.mp4";
    const posterImageUrl = hero.posterImage?.url || "/backgrounds/jp.jpg";
    const logoImageUrl = hero.logoImage?.url || "/nobglogo.png";

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
                    className="w-full h-full object-cover"
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
                                className="ml-3 px-2 py-0.5 border border-lime-300/30 bg-lime-300/10 text-lime-300 text-[9px] font-black uppercase tracking-wider rounded animate-pulse hover:bg-lime-300/20 hover:border-lime-300 transition-all z-30 cursor-pointer"
                            >
                                [ Connect ]
                            </a>
                        </motion.div>

                        <div className="hero-heading-wrapper">
                            <a
                                href="https://discord.gg/kmhq"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block relative z-20"
                            >
                                <motion.h1
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0, letterSpacing: heroHovered ? "-0.055em" : "-0.03em" }}
                                    transition={{ delay: 0.5, duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                    className="hero-heading text-glow transition-all duration-300 group-hover:text-lime-300 group-hover:scale-[1.01] flex items-center"
                                >
                                    {decodedHeading1}
                                    <span className="hidden md:inline-block ml-6 text-sm font-mono uppercase tracking-[0.3em] text-lime-400/80 border border-lime-400/30 bg-lime-400/10 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
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
                                className="group block relative z-20"
                            >
                                <motion.h1
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0, scale: heroHovered ? 1.025 : 1 }}
                                    transition={{ delay: 0.6, duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                                    className="hero-heading accent text-glow transition-all duration-300 group-hover:text-lime-200 group-hover:scale-[1.01] flex items-center"
                                    whileHover={{ scale: 1.05, skewX: -5 }}
                                >
                                    <img
                                        src={logoImageUrl}
                                        alt="Khalai Makhlooq"
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
