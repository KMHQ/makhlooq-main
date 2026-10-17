"use client";

import React from "react";
import { motion } from "motion/react";

export default function AboutDeckBriefing() {
    const stats = [
        { label: "Status", value: "SCENE ON", color: "text-emerald-400" },
        { label: "Mood", value: "CHILL GREEN", color: "text-cyan-400" },
        { label: "Fleet Flex", value: "MAXIMAL", color: "text-white" },
    ];

    return (
        <section className="deck-section w-screen h-screen flex-shrink-0 relative overflow-hidden bg-[#05070A] border-l border-emerald-500/10">
            <div className="absolute inset-0 opacity-40">
                <img
                    src="/backgrounds/SC-3.18_20230327_155336_Sunny-Daymar-Walk_f.png"
                    alt="Briefing Room"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 h-full flex items-center justify-center px-12 md:px-24">
                <div className="grid md:grid-cols-2 gap-16 max-w-6xl w-full">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="font-mono text-emerald-500 text-[10px] tracking-[0.5em] uppercase px-4 py-1 border border-emerald-500/20 bg-emerald-500/5 w-fit"
                        >
                            ◈ Deck 02: Strategic Briefing ◈
                        </motion.div>

                        <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[0.9]">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="block"
                            >
                                MASTI
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-emerald-500 block"
                            >
                                PARAMETERS
                            </motion.span>
                        </h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="text-gray-400 text-lg leading-relaxed font-light border-l-2 border-emerald-500/20 pl-6"
                        >
                            We know the routes through Stanton and Pyro both. <br />
                            Pro wings deploy on demand, but the attitude stays light.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 100 }}
                                className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] flex justify-between items-center group hover:bg-emerald-500/5 transition-all duration-500 hover:border-emerald-500/20"
                            >
                                <div className="space-y-1">
                                    <div className="font-mono text-[10px] uppercase text-gray-500 tracking-widest">{stat.label}</div>
                                    <div
                                        className={`font-mono text-xl font-bold ${stat.color} group-hover:scale-105 transition-transform origin-left`}
                                    >
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
