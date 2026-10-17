"use client";

import React from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function TeamPhysicsSidebar({ physics, setPhysics, defaultPhysics }) {
    return (
        <aside className="w-full xl:w-80 shrink-0 p-6 rounded-2xl border flex flex-col gap-6 shadow-xl h-fit bg-[#040c08]/70 border-emerald-500/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-emerald-500" /> Physics Engine
                </h2>
                <button
                    onClick={() => setPhysics(defaultPhysics)}
                    className="flex items-center gap-1 p-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Reset Physics"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="w-full">
                    <div className="flex justify-between mb-3">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Repulsion Force</label>
                        <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{physics.repel}</span>
                    </div>
                    <input
                        type="range"
                        min="500"
                        max="5000"
                        step="100"
                        value={physics.repel}
                        onChange={(e) => setPhysics((p) => ({ ...p, repel: Number(e.target.value) }))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg appearance-none"
                    />
                </div>

                <div className="w-full">
                    <div className="flex justify-between mb-3">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Spring Strength</label>
                        <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                            {physics.spring.toFixed(3)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.005"
                        max="0.1"
                        step="0.001"
                        value={physics.spring}
                        onChange={(e) => setPhysics((p) => ({ ...p, spring: Number(e.target.value) }))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg appearance-none"
                    />
                </div>

                <div className="w-full">
                    <div className="flex justify-between mb-3">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Damping Factor</label>
                        <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                            {physics.damp.toFixed(2)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.01"
                        value={physics.damp}
                        onChange={(e) => setPhysics((p) => ({ ...p, damp: Number(e.target.value) }))}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg appearance-none"
                    />
                </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-3">Simulation Stats</div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Active Nodes</span>
                        <span className="text-white font-mono">156</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Computation</span>
                        <span className="text-emerald-400 font-mono">GPU-ACCEL</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
