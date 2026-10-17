"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import FleetGlassPanel from "./FleetGlassPanel";

export default function FleetShipShowcase({ ship, index, totalShips, onShipClick }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-20%" });

    return (
        <div
            ref={ref}
            className="min-h-screen flex items-center justify-center relative cursor-pointer group"
            onClick={() => onShipClick(ship)}
            id={`fleet-${ship.id}`}
        >
            <div className="absolute inset-0">
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                        index % 2 === 0
                            ? "from-blue-900/20 via-purple-900/10 to-transparent"
                            : "from-purple-900/20 via-cyan-900/10 to-transparent"
                    }`}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -100, rotateY: -30 }}
                        animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
                                animate={{ y: ["-100%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <img
                                src={ship.image}
                                alt={ship.name}
                                className="w-full h-auto rounded-2xl border border-cyan-500/30 shadow-2xl"
                                style={{ boxShadow: "0 0 60px rgba(0, 255, 255, 0.3), inset 0 0 60px rgba(147, 51, 234, 0.2)" }}
                            />
                            {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner, i) => {
                                const isTop = corner.includes("top");
                                const isLeft = corner.includes("left");
                                return (
                                    <motion.div
                                        key={corner}
                                        className={`absolute ${isTop ? "top-4" : "bottom-4"} ${isLeft ? "left-4" : "right-4"} w-8 h-8`}
                                        style={{
                                            borderTop: isTop ? "2px solid #00ffff" : "none",
                                            borderBottom: !isTop ? "2px solid #00ffff" : "none",
                                            borderLeft: isLeft ? "2px solid #00ffff" : "none",
                                            borderRight: !isLeft ? "2px solid #00ffff" : "none",
                                        }}
                                        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 1, delay: 0.4 }}
                        >
                            <div className="text-sm font-mono text-cyan-400 mb-2">
                                SHIP #{index + 1} OF {totalShips}
                            </div>
                            <h2 className="text-5xl lg:text-6xl font-bold font-mono mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                {ship.name}
                            </h2>
                            <div className="flex gap-4 mb-6">
                                <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 font-mono text-sm">
                                    {ship.class}
                                </span>
                                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 font-mono text-sm">
                                    {ship.role}
                                </span>
                            </div>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8">{ship.description}</p>
                        </motion.div>

                        <FleetGlassPanel delay={0.6}>
                            <h3 className="text-2xl font-mono text-cyan-400 mb-4 tracking-tighter">TECHNICAL SPECIFICATIONS</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">CREW</span>
                                        <span className="text-white font-mono font-bold">{ship.crew}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">LENGTH</span>
                                        <span className="text-white font-mono font-bold">{ship.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">MASS</span>
                                        <span className="text-white font-mono font-bold">{ship.mass}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">CARGO</span>
                                        <span className="text-white font-mono font-bold">{ship.cargo}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">TOP SPEED</span>
                                        <span className="text-white font-mono font-bold">{ship.topSpeed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-mono text-sm">SHIELDS</span>
                                        <span className="text-white font-mono font-bold">{ship.specs.shields}</span>
                                    </div>
                                </div>
                            </div>
                        </FleetGlassPanel>

                        <FleetGlassPanel delay={0.8}>
                            <h3 className="text-2xl font-mono text-purple-400 mb-4 tracking-tighter">COMBAT PROFILE</h3>
                            <div className="space-y-3">
                                {["armor", "maneuverability", "weapons"].map((stat, i) => {
                                    const val = ship.specs[stat];
                                    const pct =
                                        stat === "armor"
                                            ? val === "Heavy"
                                                ? "90%"
                                                : val === "Medium"
                                                  ? "60%"
                                                  : "30%"
                                            : stat === "maneuverability"
                                              ? val === "Very High"
                                                  ? "95%"
                                                  : val === "High"
                                                    ? "75%"
                                                    : val === "Medium"
                                                      ? "50%"
                                                      : "25%"
                                              : "80%";
                                    const grad =
                                        stat === "armor"
                                            ? "from-purple-500 to-pink-500"
                                            : stat === "maneuverability"
                                              ? "from-cyan-500 to-blue-500"
                                              : "from-red-500 to-orange-500";
                                    return (
                                        <div key={stat}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-400 font-mono text-xs uppercase">{stat}</span>
                                                <span className="text-white font-mono text-xs">{val}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${grad}`}
                                                    initial={{ width: 0 }}
                                                    animate={isInView ? { width: pct } : {}}
                                                    transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </FleetGlassPanel>
                    </div>
                </div>
            </div>
        </div>
    );
}
