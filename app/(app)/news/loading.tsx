"use client";

import React from "react";

export default function NewsLoading() {
    return (
        <div className="min-h-screen bg-[#020402] p-8 flex flex-col items-center justify-center space-y-8">
            {/* Header Skeleton */}
            <div className="w-full max-w-4xl h-48 bg-lime-500/5 border border-lime-500/20 rounded-3xl animate-pulse flex items-center justify-center overflow-hidden relative">
                <div className="w-48 h-48 rounded-full border-2 border-lime-500/20 animate-spin" style={{ animationDuration: "6s" }} />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex gap-3 w-full max-w-4xl overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-28 bg-lime-500/5 border border-lime-500/10 rounded-xl animate-pulse" />
                ))}
            </div>

            {/* Grid Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 bg-lime-500/5 border border-lime-500/10 rounded-2xl animate-pulse p-6 space-y-4">
                        <div className="h-4 w-1/3 bg-lime-500/20 rounded" />
                        <div className="h-6 w-3/4 bg-lime-500/20 rounded" />
                        <div className="h-20 w-full bg-lime-500/10 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}
