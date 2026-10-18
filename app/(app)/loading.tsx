"use client";

// ▸ LOADING SKELETON (Performance: Prevents layout shift during Suspense)
// This component displays while page sections load, preventing cumulative layout shift (CLS)

export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Hero Skeleton */}
            <div className="relative z-10 flex flex-col items-center space-y-6 max-w-4xl w-full px-6">
                <div className="w-20 h-20 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />

                <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="h-12 w-3/4 bg-emerald-500/10 rounded-lg animate-pulse" />
                    <div className="h-6 w-1/2 bg-emerald-500/5 rounded-lg animate-pulse" />
                </div>

                <div className="flex gap-4 pt-8">
                    <div className="h-12 w-32 bg-emerald-500/20 rounded-md animate-pulse" />
                    <div className="h-12 w-32 bg-white/5 rounded-md animate-pulse" />
                </div>
            </div>

            {/* HUD Accents */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-emerald-500/20" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-emerald-500/20" />

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
