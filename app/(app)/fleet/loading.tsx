// ▸ FLEET ROUTE LOADING BOUNDARY (Performance: Prevents full-page blocking)

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="text-center">
                <div className="mb-6 flex justify-center">
                    <div className="border-3 h-12 w-12 animate-spin rounded-full border-emerald-500/20 border-t-emerald-500" />
                </div>
                <p className="font-mono text-emerald-400">Loading Fleet...</p>
            </div>
        </div>
    );
}
