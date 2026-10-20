"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

// ▸ ERROR BOUNDARY (Best Practices: Graceful error handling)
// Catches errors in child components and displays user-friendly message
// Prevents entire app from crashing due to single component error

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Log error to monitoring service (Sentry, LogRocket, etc.)
        console.error("Page error:", error);

        // Optional: Send to error tracking service
        // if (typeof window !== 'undefined') {
        //   reportErrorToService(error);
        // }
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
            <div className="w-full max-w-md text-center">
                {/* Error icon */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl" />
                        <AlertTriangle className="relative h-16 w-16 text-red-500" />
                    </div>
                </div>

                {/* Error message */}
                <h1 className="mb-2 text-3xl font-bold">Something went wrong</h1>
                <p className="mb-6 text-gray-400">An unexpected error occurred. Our team has been notified. Please try again.</p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 max-h-40 overflow-auto rounded-lg bg-gray-900 p-4 text-left text-sm text-gray-300">
                        <code className="text-red-400">{error.message}</code>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-center gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-emerald-600"
                    >
                        <RotateCcw size={18} />
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
