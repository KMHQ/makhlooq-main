"use client";

import React from "react";
import { motion } from "motion/react";
import { Users, ChevronRight } from "lucide-react";

export default function JoinCommunityCTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20 rounded-3xl p-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Users className="text-emerald-400" size={32} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Join the Crew</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Jump into Discord, meet the pilots, get into ops, and grow your rank.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            <a
                                href="https://discord.gg/K7SfxPSwXk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all group"
                            >
                                Join Discord <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
