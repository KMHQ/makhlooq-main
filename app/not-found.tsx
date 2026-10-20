import type { Metadata } from "next";
import Link from "next/link";
// Unmatched URLs render this without any layout, so it brings its own styles.
import "./(app)/globals.css";

export const metadata: Metadata = { title: "404 - Not Found | Khalai Makhlooq" };

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4 text-center font-mono text-white">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
                <h2 className="mb-4 uppercase tracking-widest text-lime-400">Signal Lost // 404</h2>
                <p className="text-sm text-neutral-400">The requested coordinates do not contain any active KMHQ dispatches.</p>
                <Link
                    href="/"
                    className="mt-6 inline-block rounded-xl bg-lime-400 px-6 py-2 text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
                >
                    Return to Bridge
                </Link>
            </div>
        </div>
    );
}
