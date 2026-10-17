"use client";

import React from "react";
import { motion } from "motion/react";

export default function AboutDeckHangar() {
    const stats = [
        { label: "Active Wings", value: "48" },
        { label: "Big Ships", value: "06" },
        { label: "Vibe Success", value: "99.8%" },
    ];

    return (
        <section className="deck-section w-screen h-screen flex-shrink-0 relative overflow-hidden bg-black border-l border-emerald-500/10">
            <div className="absolute inset-0 opacity-60">
                <img
                    src="/backgrounds/SC-4.0_20250128_102956_Avenger-over-Bloom_f.png"
                    alt="The Hangar"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="font-mono text-emerald-500 text-[10px] tracking-[0.5em] uppercase mb-8"
                    >
                        ◈ Deck 03: Hangar & Logistics ◈
                    </motion.div>

                    <div className="overflow-hidden mb-12">
                        <motion.h2
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                            className="text-5xl md:text-9xl font-bold text-white tracking-tighter"
                        >
                            HANGAR <span className="text-emerald-500">FLEX</span>
                        </motion.h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 max-w-4xl">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + i * 0.2, duration: 0.5 }}
                                className="group relative"
                            >
                                <div className="text-5xl md:text-8xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                    {stat.value}
                                </div>
                                <div className="font-mono text-[10px] uppercase text-emerald-500/40 tracking-[0.3em]">{stat.label}</div>

                                {/* Decorative dot */}
                                <div className="absolute -top-4 -right-4 w-1 h-1 bg-emerald-500 rounded-full" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rotating HUD Element */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-32 -right-32 w-96 h-96 border border-emerald-500/10 rounded-full border-dashed pointer-events-none"
            />
        </section>
    );
}
