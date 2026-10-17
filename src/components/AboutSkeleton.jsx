"use client";

import React from "react";

export default function AboutSkeleton() {
    return (
        <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center p-8 space-y-12">
            <div className="w-full max-w-5xl h-96 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl animate-pulse flex items-center justify-center overflow-hidden">
                <div className="w-64 h-64 rounded-full border border-emerald-500/10 animate-spin-slow" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-pulse" />
                ))}
            </div>
            <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
