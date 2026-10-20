"use client";

import React from "react";

export default function NewsLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-[#020402] p-8">
            {/* Header Skeleton */}
            <div className="relative flex h-48 w-full max-w-4xl animate-pulse items-center justify-center overflow-hidden rounded-3xl border border-lime-500/20 bg-lime-500/5">
                <div className="h-48 w-48 animate-spin rounded-full border-2 border-lime-500/20" style={{ animationDuration: "6s" }} />
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex w-full max-w-4xl gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-28 animate-pulse rounded-xl border border-lime-500/10 bg-lime-500/5" />
                ))}
            </div>

            {/* Grid Content Skeleton */}
            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 animate-pulse space-y-4 rounded-2xl border border-lime-500/10 bg-lime-500/5 p-6">
                        <div className="h-4 w-1/3 rounded bg-lime-500/20" />
                        <div className="h-6 w-3/4 rounded bg-lime-500/20" />
                        <div className="h-20 w-full rounded bg-lime-500/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}
