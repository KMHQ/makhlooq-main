"use client";

// ▸ LOADING SKELETON (Performance: Prevents layout shift during Suspense)
// This component displays while page sections load, preventing cumulative layout shift (CLS)

export default function Loading() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Hero Skeleton */}
            <div className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-6 px-6">
                <div className="h-20 w-20 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />

                <div className="flex w-full flex-col items-center space-y-3">
                    <div className="h-12 w-3/4 animate-pulse rounded-lg bg-emerald-500/10" />
                    <div className="h-6 w-1/2 animate-pulse rounded-lg bg-emerald-500/5" />
                </div>

                <div className="flex gap-4 pt-8">
                    <div className="h-12 w-32 animate-pulse rounded-md bg-emerald-500/20" />
                    <div className="h-12 w-32 animate-pulse rounded-md bg-white/5" />
                </div>
            </div>

            {/* HUD Accents */}
            <div className="absolute left-10 top-10 h-20 w-20 border-l border-t border-emerald-500/20" />
            <div className="absolute bottom-10 right-10 h-20 w-20 border-b border-r border-emerald-500/20" />

            <style>{`
        div { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
