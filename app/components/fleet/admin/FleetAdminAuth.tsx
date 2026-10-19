"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Rocket, Shield, LogOut, ArrowLeft } from "lucide-react";

export function AuthScreen({ text = "Initializing Secure Link..." }: { text?: string }) {
    return (
        <div className="min-h-screen bg-[#020402] text-white flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin relative z-10" />
            <p className="text-emerald-500/70 font-mono text-[10px] tracking-[0.2em] uppercase relative z-10 animate-pulse">{text}</p>
        </div>
    );
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
    return (
        <div className="min-h-screen bg-[#020402] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.15),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/[0.07] bg-[#050B08]/80 p-12 backdrop-blur-3xl text-center shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
                <div className="w-20 h-20 mx-auto mb-8 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                    <div className="absolute inset-0 rounded-[1.5rem] bg-emerald-400/20 blur-xl mix-blend-screen" />
                    <Rocket size={36} className="text-emerald-400 relative z-10" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500 mb-4">KMHQ Secure Interface</div>
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                    Admin <span className="text-emerald-500">Access</span>
                </h1>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                    Authenticate with your Discord account to gain administrative control over the master Fleet Registry.
                </p>
                <button
                    onClick={onLogin}
                    className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-all shadow-[0_0_30px_rgba(88,101,242,0.3)] hover:shadow-[0_0_40px_rgba(88,101,242,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-3 text-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                    Sign in with Discord
                </button>
                <Link
                    href="/fleet"
                    className="inline-flex items-center gap-2 mt-8 text-emerald-500/50 text-[10px] hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] font-bold"
                >
                    <ArrowLeft size={12} /> Return to Public Fleet
                </Link>
            </motion.div>
        </div>
    );
}

export function DeniedScreen({ onLogout }: { onLogout: () => void }) {
    return (
        <div className="min-h-screen bg-[#020402] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(239,68,68,0.1),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/[0.07] bg-[#0A0505]/80 p-12 backdrop-blur-3xl text-center shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
                <div className="w-20 h-20 mx-auto mb-8 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
                    <div className="absolute inset-0 rounded-[1.5rem] bg-red-400/20 blur-xl mix-blend-screen" />
                    <Shield size={36} className="text-red-400 relative z-10" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-red-500 mb-4">Security Alert</div>
                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                    Access <span className="text-red-500">Denied</span>
                </h1>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                    Your account lacks administrative clearance. Contact KMHQ Command if you believe this is an error.
                </p>
                <button
                    onClick={onLogout}
                    className="w-full py-4 rounded-xl border border-white/10 bg-white/[0.02] text-white font-bold hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                    <LogOut size={16} /> Secure Sign Out
                </button>
                <Link
                    href="/fleet"
                    className="inline-flex items-center gap-2 mt-8 text-red-500/50 text-[10px] hover:text-red-400 transition-colors uppercase tracking-[0.2em] font-bold"
                >
                    <ArrowLeft size={12} /> Return to Public Fleet
                </Link>
            </motion.div>
        </div>
    );
}
