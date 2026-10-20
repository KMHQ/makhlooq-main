"use client";

import React from "react";

export default function AboutSkeleton() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-12 bg-[#05070A] p-8">
            <div className="flex h-96 w-full max-w-5xl animate-pulse items-center justify-center overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="animate-spin-slow h-64 w-64 rounded-full border border-emerald-500/10" />
            </div>
            <div className="grid w-full max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl border border-emerald-500/10 bg-emerald-500/5" />
                ))}
            </div>
            <style>{`
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
