"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Fleet Loading Failed</h1>
                <p className="text-gray-400 mb-6">Unable to load the fleet interface. This may be a temporary issue.</p>
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
                >
                    <RotateCcw size={16} />
                    Retry
                </button>
            </div>
        </div>
    );
}
