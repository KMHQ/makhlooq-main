"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function FleetHUD({ ship, onResetCamera, onPrev, onNext, totalShips, currentIndex }) {
    const [time, setTime] = useState("00:00:00");

    useEffect(() => {
        const tick = () => {
            setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <div className="fleet-bracket fleet-bracket-tl" />
            <div className="fleet-bracket fleet-bracket-tr" />
            <div className="fleet-bracket fleet-bracket-bl" />
            <div className="fleet-bracket fleet-bracket-br" />

            <div className="absolute left-6 top-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={ship?.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Active Asset</div>
                        <div className="font-mono text-lg font-bold tracking-tight text-white">{ship?.name || "—"}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-white/25">{ship?.class || ""}</div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute right-6 top-6 text-right">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">UEE Standard Time</div>
                <div className="font-mono text-lg tabular-nums text-white">{time}</div>
                <div className="mt-2 flex items-center justify-end gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/35">All Systems Nominal</span>
                </div>
            </div>

            <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
                <button onClick={onPrev} className="fleet-hud-btn" title="Previous ship">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                        {(currentIndex + 1).toString().padStart(2, "0")} / {totalShips.toString().padStart(2, "0")}
                    </span>
                </div>

                <button onClick={onNext} className="fleet-hud-btn" title="Next ship">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>

                <div className="mx-1 h-6 w-px bg-white/10" />

                <button onClick={onResetCamera} className="fleet-hud-btn" title="Reset camera">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                </button>
            </div>

            <div className="absolute bottom-6 left-6">
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/20">
                    ← → Navigate &nbsp;·&nbsp; Drag to orbit &nbsp;·&nbsp; Scroll to zoom
                </div>
            </div>

            <div className="fleet-viewport-scanline" />
        </div>
    );
}
