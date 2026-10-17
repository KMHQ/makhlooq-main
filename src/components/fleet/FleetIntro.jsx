"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const BOOT_MESSAGES = [
    "Establishing quantum-encrypted link...",
    "Loading UEE fleet registry...",
    "Verifying pilot credentials...",
    "Syncing hangar manifest...",
    "Initializing holographic renderer...",
    "Calibrating sensor arrays...",
    "Fleet database synchronized.",
    "SYSTEM ONLINE",
];

export default function FleetIntro({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [phase, setPhase] = useState("boot"); // boot → ready → exit

    useEffect(() => {
        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            const newProgress = Math.min(100, frame * 2.5);
            setProgress(newProgress);
            setMessageIndex(Math.min(BOOT_MESSAGES.length - 1, Math.floor(frame / 5)));

            if (newProgress >= 100) {
                clearInterval(interval);
                setPhase("ready");
                setTimeout(() => {
                    setPhase("exit");
                    setTimeout(onComplete, 800);
                }, 600);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[200] bg-[#040806] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.03]">
                <svg width="100%" height="100%">
                    <defs>
                        <pattern id="intro-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#intro-grid)" />
                </svg>
            </div>

            {/* Logo/Brand */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 relative z-10"
            >
                <div className="w-16 h-16 mx-auto mb-6 border border-emerald-500/30 rounded-xl flex items-center justify-center rotate-45">
                    <div className="-rotate-45">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold font-mono tracking-[0.15em] text-white mb-2">
                    FLEET<span className="text-emerald-400">COMMAND</span>
                </h1>
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em]">Khalai Makhlooq Tactical Systems</p>
            </motion.div>

            {/* Boot messages */}
            <div className="w-80 relative z-10 mb-8">
                <div className="h-24 overflow-hidden mb-4">
                    {BOOT_MESSAGES.slice(0, messageIndex + 1).map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: i === messageIndex ? 1 : 0.3, x: 0 }}
                            className={`text-xs font-mono mb-1 ${
                                i === BOOT_MESSAGES.length - 1 && messageIndex === i ? "text-emerald-400 font-bold" : "text-gray-600"
                            }`}
                        >
                            <span className="text-emerald-400/40 mr-2">{">"}</span>
                            {msg}
                        </motion.div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-[2px] bg-gray-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">
                        {phase === "ready" ? "INITIALIZATION COMPLETE" : "INITIALIZING"}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 tabular-nums">{Math.round(progress)}%</span>
                </div>
            </div>
        </motion.div>
    );
}
