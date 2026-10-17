"use client";

import React from "react";
import { motion } from "motion/react";
import FleetGlassPanel from "./FleetGlassPanel";

export default function FleetCommandStats() {
    const stats = [
        { label: "TOTAL FLEET SIZE", value: 47, suffix: " VESSELS", color: "text-cyan-400", grad: "from-cyan-400 to-cyan-600" },
        { label: "COMBAT UNITS", value: 23, suffix: " ACTIVE", color: "text-purple-400", grad: "from-purple-400 to-purple-600" },
        { label: "CARGO CAPACITY", value: 12500, suffix: " SCU", color: "text-pink-400", grad: "from-pink-400 to-pink-600" },
        { label: "ACTIVE MEMBERS", value: 156, suffix: " PERSONNEL", color: "text-blue-400", grad: "from-blue-400 to-blue-600" },
    ];

    return (
        <div
            id="stats"
            className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 py-20"
        >
            <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl lg:text-6xl font-bold font-mono mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
                        COMMAND STATISTICS
                    </h2>
                    <p className="text-gray-400 font-mono text-lg">Real-time fleet operational metrics</p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                            <FleetGlassPanel className="text-center py-10">
                                <div className={`text-[10px] font-mono ${stat.color} mb-3 uppercase tracking-[0.2em]`}>{stat.label}</div>
                                <div
                                    className={`text-4xl lg:text-5xl font-bold font-mono bg-gradient-to-r ${stat.grad} bg-clip-text text-transparent`}
                                >
                                    {stat.value.toLocaleString()}
                                    <span className="text-xs text-gray-500 ml-2 font-normal">{stat.suffix}</span>
                                </div>
                            </FleetGlassPanel>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
