"use client";

import React from "react";
import { motion } from "motion/react";

export default function AboutDeckBridge({ settings }) {
    const sentence = settings?.bridge_heading || "KHALAI MAKHLOOQ";
    const words = sentence.split(" ");
    const subtitle = settings?.bridge_subtitle || "From Stanton to Pyro, the route gets spicy. Crew tight, vibe light.";
    const backgroundImage = settings?.bridge_background_url || "/backgrounds/SC-3.22_20240301_203233_Zephyr-sun_f.png";

    return (
        <section className="deck-section w-screen h-screen flex-shrink-0 relative overflow-hidden bg-black">
            {/* Background with subtle zoom */}
            <motion.div
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0"
            >
                <img src={backgroundImage} alt="Fleet Command" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12">
                <div className="overflow-hidden mb-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="font-mono text-emerald-500 text-[10px] tracking-[0.8em] uppercase"
                    >
                        ◈ Deck 01: Fleet Command ◈
                    </motion.div>
                </div>

                <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-none mb-6 flex flex-wrap justify-center gap-x-8">
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ y: 100, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.2,
                                ease: [0.33, 1, 0.68, 1],
                            }}
                            className="inline-block"
                        >
                            {word === "MAKHLOOQ" ? <span className="text-emerald-500">{word}</span> : word}
                        </motion.span>
                    ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="max-w-xl mx-auto text-gray-500 font-mono text-xs md:text-sm tracking-widest uppercase border-t border-white/10 pt-8"
                >
                    {subtitle}
                </motion.p>
            </div>

            {/* Animated Scanline */}
            <motion.div
                animate={{ y: ["0%", "1000%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-px bg-emerald-500/10 z-20 pointer-events-none"
            />
        </section>
    );
}
