"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Rocket, Shield, LogOut, ArrowLeft } from "lucide-react";

export function AuthScreen({ text = "Initializing Secure Link..." }: { text?: string }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#020402] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
            <div className="relative z-10 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="relative z-10 animate-pulse font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500/70">{text}</p>
        </div>
    );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020402] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.15),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/[0.07] bg-[#050B08]/80 p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-3xl"
            >
                <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <div className="absolute inset-0 rounded-[1.5rem] bg-emerald-400/20 mix-blend-screen blur-xl" />
                    <Rocket size={36} className="relative z-10 text-emerald-400" />
                </div>
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">KMHQ Secure Interface</div>
                <h1 className="mb-3 text-4xl font-black tracking-tight text-white">
                    Admin <span className="text-emerald-500">Access</span>
                </h1>
                <p className="mb-10 text-sm leading-relaxed text-gray-400">
                    Authenticate with your Discord account to gain administrative control over the master Fleet Registry.
                </p>
                <button
                    onClick={onLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(88,101,242,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#4752C4] hover:shadow-[0_0_40px_rgba(88,101,242,0.5)]"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                    Sign in with Discord
                </button>
                <Link
                    href="/fleet"
                    className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/50 transition-colors hover:text-emerald-400"
                >
                    <ArrowLeft size={12} /> Return to Public Fleet
                </Link>
            </motion.div>
        </div>
    );
}

export function DeniedScreen({ onLogout }: { onLogout: () => void }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020402] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(239,68,68,0.1),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/[0.07] bg-[#0A0505]/80 p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-3xl"
            >
                <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-red-500/20 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <div className="absolute inset-0 rounded-[1.5rem] bg-red-400/20 mix-blend-screen blur-xl" />
                    <Shield size={36} className="relative z-10 text-red-400" />
                </div>
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-red-500">Security Alert</div>
                <h1 className="mb-3 text-4xl font-black tracking-tight text-white">
                    Access <span className="text-red-500">Denied</span>
                </h1>
                <p className="mb-10 text-sm leading-relaxed text-gray-400">
                    Your account lacks administrative clearance. Contact KMHQ Command if you believe this is an error.
                </p>
                <button
                    onClick={onLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-4 text-sm font-bold text-white transition-all hover:border-white/20 hover:bg-white/5"
                >
                    <LogOut size={16} /> Secure Sign Out
                </button>
                <Link
                    href="/fleet"
                    className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/50 transition-colors hover:text-red-400"
                >
                    <ArrowLeft size={12} /> Return to Public Fleet
                </Link>
            </motion.div>
        </div>
    );
}
