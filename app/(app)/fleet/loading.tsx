// ▸ FLEET ROUTE LOADING BOUNDARY (Performance: Prevents full-page blocking)

export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-12 h-12 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
                <p className="text-emerald-400 font-mono">Loading Fleet...</p>
            </div>
        </div>
    );
}
