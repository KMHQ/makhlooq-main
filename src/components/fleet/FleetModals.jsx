"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// Ship Detail Modal Component
export function ShipDetailModal({ ship, isOpen, onClose }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsLoaded(true), 100);

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === "Escape") {
                    onClose();
                }
            };

            // Trap focus within modal
            const handleTab = (e) => {
                if (e.key === "Tab") {
                    const modal = document.querySelector('[role="dialog"]');
                    if (modal) {
                        const focusableElements = modal.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                        );
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];

                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                e.preventDefault();
                                lastElement.focus();
                            }
                        } else {
                            if (document.activeElement === lastElement) {
                                e.preventDefault();
                                firstElement.focus();
                            }
                        }
                    }
                }
            };

            document.addEventListener("keydown", handleEscape);
            document.addEventListener("keydown", handleTab);

            return () => {
                clearTimeout(timer);
                document.removeEventListener("keydown", handleEscape);
                document.removeEventListener("keydown", handleTab);
            };
        } else {
            setIsLoaded(false);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            >
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={`modal-particle-${i}`}
                            className="absolute w-1 h-1 rounded-full bg-cyan-400"
                            initial={{
                                x: typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
                                y: typeof window !== "undefined" ? Math.random() * window.innerHeight : 0,
                                opacity: 0,
                            }}
                            animate={{
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0],
                                y: [0, -150, -300],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: i * 0.1,
                                repeat: Infinity,
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-gradient-to-br from-gray-900/90 via-black/80 to-gray-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                    style={{
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 255, 0.1)",
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(0, 255, 255, 0.2)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-all z-20 focus-visible"
                        aria-label="Close ship details modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>

                    <div className="relative p-8 overflow-y-auto max-h-[90vh]">
                        <div className="grid lg:grid-cols-2 gap-8 mb-8">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
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
                                </motion.div>
                            </div>

                            <div className="space-y-6">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                    <h2 className="text-4xl lg:text-5xl font-bold font-mono mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
                                    <p className="text-gray-300 text-lg leading-relaxed">{ship.description}</p>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            label: "Crew",
                                            value: ship.crew,
                                            grad: "from-cyan-500/10 to-blue-500/10",
                                            color: "text-cyan-400",
                                            border: "border-cyan-500/20",
                                        },
                                        {
                                            label: "Length",
                                            value: ship.length,
                                            grad: "from-purple-500/10 to-pink-500/10",
                                            color: "text-purple-400",
                                            border: "border-purple-500/20",
                                        },
                                        {
                                            label: "Cargo",
                                            value: ship.cargo,
                                            grad: "from-pink-500/10 to-red-500/10",
                                            color: "text-pink-400",
                                            border: "border-pink-500/20",
                                        },
                                        {
                                            label: "Speed",
                                            value: ship.topSpeed,
                                            grad: "from-orange-500/10 to-yellow-500/10",
                                            color: "text-orange-400",
                                            border: "border-orange-500/20",
                                        },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            className={`bg-gradient-to-br ${stat.grad} backdrop-blur-sm border ${stat.border} rounded-xl p-4`}
                                        >
                                            <div className={`${stat.color} font-mono text-[10px] uppercase tracking-wider mb-1`}>
                                                {stat.label}
                                            </div>
                                            <div className="text-white font-mono text-xl font-bold">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                            <h3 className="text-2xl font-mono text-cyan-400 mb-6 tracking-tighter">TECHNICAL SPECIFICATIONS</h3>
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                                {[
                                    { label: "SHIELDS", value: ship.specs.shields, color: "text-cyan-400" },
                                    { label: "ARMOR", value: ship.specs.armor, color: "text-purple-400" },
                                    { label: "MASS", value: ship.mass, color: "text-white" },
                                    { label: "WEAPONS", value: ship.specs.weapons, color: "text-pink-400" },
                                    { label: "SIGNATURE", value: ship.specs.signature, color: "text-orange-400" },
                                    { label: "MANEUVERABILITY", value: ship.specs.maneuverability, color: "text-green-400" },
                                ].map((spec) => (
                                    <div key={spec.label} className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-500 font-mono text-xs uppercase">{spec.label}</span>
                                        <span className={`${spec.color} font-mono font-bold text-sm`}>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export function ArmorDetailModal({ suit, isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-black/80 backdrop-blur-2xl border border-purple-500/30 rounded-3xl max-w-4xl w-full overflow-hidden p-8 shadow-2xl"
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                            <img src={suit.image} alt={suit.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold font-mono text-white mb-2">{suit.name}</h2>
                                <div className="flex gap-3">
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-mono">
                                        {suit.type}
                                    </span>
                                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-mono">
                                        {suit.protection}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{suit.description}</p>
                            <div className="space-y-3">
                                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Integrated Systems</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suit.features.map((f) => (
                                        <span
                                            key={f}
                                            className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded-lg text-[10px] font-mono"
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
