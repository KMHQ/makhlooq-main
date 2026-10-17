"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import FleetGlassPanel from "./FleetGlassPanel";

export default function FleetArmorAssembly({ suit, index, onArmorClick }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20%" });

    return (
        <div
            ref={ref}
            className="min-h-screen flex items-center justify-center relative cursor-pointer group"
            onClick={() => onArmorClick(suit)}
            id={`armor-${suit.id}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-3xl blur-xl" />
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 border-2 border-purple-500/50 rounded-full flex items-center justify-center"
                            >
                                <span className="text-purple-400 font-mono text-xs">HELMET</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="absolute top-32 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/20 border-2 border-pink-500/50 rounded-full flex items-center justify-center"
                            >
                                <span className="text-pink-400 font-mono text-xs">CHEST</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="absolute top-40 left-20 w-24 h-24 bg-red-500/20 border-2 border-red-500/50 rounded-full flex items-center justify-center"
                            >
                                <span className="text-red-400 font-mono text-xs">L-ARM</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="absolute top-40 right-20 w-24 h-24 bg-orange-500/20 border-2 border-orange-500/50 rounded-full flex items-center justify-center"
                            >
                                <span className="text-orange-400 font-mono text-xs">R-ARM</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-full flex items-center justify-center"
                            >
                                <span className="text-yellow-400 font-mono text-xs">LEGS</span>
                            </motion.div>
                            <img
                                src={suit.image}
                                alt={suit.name}
                                className="w-full h-auto rounded-2xl border border-purple-500/30 shadow-2xl"
                                style={{ boxShadow: "0 0 60px rgba(147, 51, 234, 0.3), inset 0 0 60px rgba(236, 72, 153, 0.2)" }}
                            />
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <div className="text-sm font-mono text-purple-400 mb-2">ARMOR SUIT #{index + 1}</div>
                            <h2 className="text-5xl lg:text-6xl font-bold font-mono mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tighter">
                                {suit.name}
                            </h2>
                            <div className="flex gap-4 mb-6">
                                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 font-mono text-sm">
                                    {suit.type}
                                </span>
                                <span className="px-4 py-2 bg-pink-500/20 border border-pink-500/50 rounded-full text-pink-400 font-mono text-sm">
                                    {suit.protection} Protection
                                </span>
                            </div>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8">{suit.description}</p>
                        </motion.div>

                        <FleetGlassPanel delay={0.5}>
                            <h3 className="text-2xl font-mono text-purple-400 mb-4 tracking-tighter">INTEGRATED SYSTEMS</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                {suit.features.map((feature, i) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                                        transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                        <span className="text-white font-mono text-xs">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </FleetGlassPanel>

                        <FleetGlassPanel delay={0.7}>
                            <h3 className="text-2xl font-mono text-pink-400 mb-4 tracking-tighter">PERFORMANCE METRICS</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-400 font-mono text-xs">PROTECTION</span>
                                        <span className="text-white font-mono text-xs">{suit.protection}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={
                                                isInView
                                                    ? {
                                                          width:
                                                              suit.protection === "Maximum"
                                                                  ? "95%"
                                                                  : suit.protection === "Medium"
                                                                    ? "60%"
                                                                    : "30%",
                                                      }
                                                    : {}
                                            }
                                            transition={{ duration: 1.5, delay: 0.8 }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-400 font-mono text-xs">MOBILITY</span>
                                        <span className="text-white font-mono text-xs">{suit.mobility}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                            initial={{ width: 0 }}
                                            animate={
                                                isInView
                                                    ? {
                                                          width:
                                                              suit.mobility === "Enhanced"
                                                                  ? "85%"
                                                                  : suit.mobility === "Reduced"
                                                                    ? "40%"
                                                                    : "60%",
                                                      }
                                                    : {}
                                            }
                                            transition={{ duration: 1.5, delay: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FleetGlassPanel>
                    </div>
                </div>
            </div>
        </div>
    );
}
