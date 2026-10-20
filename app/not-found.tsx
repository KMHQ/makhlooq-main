import type { Metadata } from "next";
import Link from "next/link";
// Unmatched URLs render this without any layout, so it brings its own styles.
import "./(app)/globals.css";

export const metadata: Metadata = { title: "404 - Not Found | Khalai Makhlooq" };

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4 text-center">
            <div className="border border-white/10 bg-white/5 p-10 rounded-3xl">
                <h2 className="text-lime-400 tracking-widest uppercase mb-4">Signal Lost // 404</h2>
                <p className="text-neutral-400 text-sm">The requested coordinates do not contain any active KMHQ dispatches.</p>
                <Link
                    href="/"
                    className="inline-block mt-6 bg-lime-400 text-black px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-widest hover:opacity-90"
                >
                    Return to Bridge
                </Link>
            </div>
        </div>
    );
}
