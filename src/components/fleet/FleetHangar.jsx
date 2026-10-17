"use client";

import React from "react";
import { motion } from "motion/react";
import FleetGlassPanel from "./FleetGlassPanel";

export default function FleetHangar({ ships }) {
    return (
        <div
            id="hangar"
            className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900/50 to-black/50 py-20"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hangar-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#4A6D56" strokeWidth="0.5" opacity="0.3" />
                                <circle cx="50" cy="50" r="2" fill="#6B8E7B" opacity="0.2" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hangar-grid)" />
                    </svg>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl lg:text-6xl font-bold font-mono mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tighter">
                        FLEET HANGAR
                    </h2>
                    <p className="text-gray-400 font-mono text-lg">Scroll to explore our complete fleet inventory</p>
                </motion.div>

                <div
                    className="relative flex gap-8 overflow-x-auto scrollbar-hide pb-8 px-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {ships.map((ship, index) => (
                        <motion.div
                            key={ship.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="flex-shrink-0 w-80 md:w-96"
                        >
                            <FleetGlassPanel className="p-4 group transition-all duration-300 hover:border-lime-400/50 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]">
                                <div className="relative mb-4 overflow-hidden rounded-xl border border-white/10 group-hover:border-lime-400/40 transition-colors">
                                    <img
                                        src={ship.image}
                                        alt={ship.name}
                                        className="w-full h-48 object-cover opacity-95 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105 saturate-125"
                                    />
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                                        <span className="text-cyan-400 font-mono text-[10px]">BAY {index + 1}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-mono text-white mb-1 truncate">{ship.name}</h3>
                                <p className="text-cyan-400/70 font-mono text-xs mb-4 uppercase tracking-wider">{ship.class}</p>
                                <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-white/10 pt-4">
                                    <div className="space-y-1">
                                        <div className="text-gray-500 font-mono uppercase">CREW</div>
                                        <div className="text-white font-mono font-bold">{ship.crew}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-gray-500 font-mono uppercase">LENGTH</div>
                                        <div className="text-white font-mono font-bold">{ship.length}</div>
                                    </div>
                                </div>
                            </FleetGlassPanel>
                        </motion.div>
                    ))}
                </div>

                {/* Scroll indicator */}
                <motion.div className="mt-12 flex justify-center" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="w-10 h-10 border border-cyan-500/30 rounded-full flex items-center justify-center">
                        <motion.div
                            className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
