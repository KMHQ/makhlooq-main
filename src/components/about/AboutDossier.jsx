"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const PERSONNEL_DATA = {
    id: "KM-UNIT-01",
    designation: "KHALAI MAKHLOOQ",
    status: "OPERATIONAL",
    clearance: "LEVEL 5 (ADMIN)",
    founded: "2950",
    headquarters: "STATON SYSTEM",
    manifesto:
        "To secure the stars through unity, discipline, and tactical excellence. We are not just a fleet; we are the foundation of a new era in Stanton.",
    stats: [
        { label: "FLEET STRENGTH", value: "HEAVY", color: "emerald" },
        { label: "TERRITORY", value: "STANTON / PYRO", color: "cyan" },
        { label: "PILOTS", value: "120+", color: "emerald" },
        { label: "BATTLE RATING", value: "A+", color: "yellow" },
    ],
};

export default function AboutDossier() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="relative bg-[#0A0F0C] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/5">
                {/* HUD Header */}
                <div className="border-b border-emerald-500/20 p-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-emerald-500/5 to-transparent">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-400 uppercase">
                                File ID: {PERSONNEL_DATA.id}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tighter">
                            {PERSONNEL_DATA.designation} <span className="text-emerald-500/50">_</span>
                        </h1>
                    </div>

                    <div className="mt-4 md:mt-0 flex gap-6 font-mono">
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Status</div>
                            <div className="text-emerald-400 font-bold">{PERSONNEL_DATA.status}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Clearance</div>
                            <div className="text-yellow-500 font-bold">{PERSONNEL_DATA.clearance}</div>
                        </div>
                    </div>
                </div>

                {/* Main Body */}
                <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Sidebar Tabs */}
                    <div className="border-r border-emerald-500/10 p-6 space-y-2 bg-[#080C0A]">
                        {["overview", "mission", "fleet", "history"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-mono text-sm transition-all duration-300 relative group ${
                                    activeTab === tab
                                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-full"
                                    />
                                )}
                                <span className="uppercase tracking-widest">{tab}</span>
                            </button>
                        ))}

                        <div className="pt-12">
                            <div className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mb-4 px-4 font-mono">Telemetry Data</div>
                            <div className="space-y-3 px-4">
                                {PERSONNEL_DATA.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1 uppercase tracking-tighter">
                                            <span>{stat.label}</span>
                                            <span>{stat.value}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "70%" }}
                                                className="h-full bg-emerald-500/40"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 md:p-12 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                {activeTab === "overview" && (
                                    <>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <span className="text-emerald-500">01.</span> EXEC SUMMARY
                                            </h2>
                                            <p className="text-gray-400 leading-relaxed text-lg font-light">{PERSONNEL_DATA.manifesto}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-8">
                                            <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                                                <div className="text-3xl font-bold text-white mb-1">2950</div>
                                                <div className="text-xs text-emerald-400/70 font-mono tracking-widest uppercase">
                                                    Established
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-2xl border border-cyan-500/10 bg-cyan-500/5">
                                                <div className="text-3xl font-bold text-white mb-1">Global</div>
                                                <div className="text-xs text-cyan-400/70 font-mono tracking-widest uppercase">Presence</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "mission" && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span className="text-emerald-500">02.</span> STRATEGIC GOALS
                                        </h2>
                                        <div className="space-y-4">
                                            {[
                                                "Secure core trading routes in Stanton",
                                                "Establish deep-space outposts in Pyro",
                                                "Maintain a 99.8% mission success rate",
                                                "Unify pilots under a cohesive command structure",
                                            ].map((goal, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-mono">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-gray-300">{goal}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback for other tabs */}
                                {["fleet", "history"].includes(activeTab) && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                        <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                        <p className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-400">
                                            Loading Encrypted Data...
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Decorative HUD Elements */}
                <div className="absolute top-4 right-4 flex gap-1">
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                </div>

                <div className="absolute bottom-4 left-4 font-mono text-[8px] text-gray-700 tracking-tighter uppercase">
                    KMHQ_INTERNAL_USE_ONLY // NO_EXT_DISTRIBUTION
                </div>
            </div>
        </div>
    );
}
