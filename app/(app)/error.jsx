"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// ▸ ERROR BOUNDARY (Best Practices: Graceful error handling)
// Catches errors in child components and displays user-friendly message
// Prevents entire app from crashing due to single component error

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log error to monitoring service (Sentry, LogRocket, etc.)
        console.error("Page error:", error);

        // Optional: Send to error tracking service
        // if (typeof window !== 'undefined') {
        //   reportErrorToService(error);
        // }
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Error icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                        <AlertTriangle className="relative w-16 h-16 text-red-500" />
                    </div>
                </div>

                {/* Error message */}
                <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
                <p className="text-gray-400 mb-6">An unexpected error occurred. Our team has been notified. Please try again.</p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-lg text-left text-sm text-gray-300 overflow-auto max-h-40">
                        <code className="text-red-400">{error.message}</code>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors"
                    >
                        <RotateCcw size={18} />
                        Try again
                    </button>
                    <a href="/" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
                        Go home
                    </a>
                </div>
            </div>
        </div>
    );
}
