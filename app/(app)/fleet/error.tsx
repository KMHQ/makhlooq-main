"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
            <div className="max-w-md text-center">
                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <h1 className="mb-2 text-2xl font-bold">Fleet Loading Failed</h1>
                <p className="mb-6 text-gray-400">Unable to load the fleet interface. This may be a temporary issue.</p>
                <button
                    onClick={reset}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black transition-colors hover:bg-emerald-600"
                >
                    <RotateCcw size={16} />
                    Retry
                </button>
            </div>
        </div>
    );
}
