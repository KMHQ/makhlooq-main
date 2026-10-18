"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, LogOut, Shield } from "lucide-react";
import Header from "@/src/components/Header";
import ProfileEditor, { type ProfileForm } from "@/src/components/team/ProfileEditor";
import type { TeamMember } from "@/types/db";
import type { SessionResponse, SessionUser } from "@/types/session";

export default function UserProfilePage() {
    const [session, setSession] = useState<SessionUser | null>(null);
    const [member, setMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    // Form state
    const [form, setForm] = useState<ProfileForm>({ node_color: "#10b981", bio: "", status: "active" });

    useEffect(() => {
        let mounted = true;

        const loadSession = async () => {
            setLoading(true);
            const res = await fetch("/api/auth/discord/session", { cache: "no-store" });
            const data = (await res.json().catch(() => ({}))) as Partial<SessionResponse>;
            if (!mounted) return;

            if (!res.ok || !data.authenticated) {
                setSession(null);
                setMember(null);
                setLoading(false);
                return;
            }

            setSession(data.user ?? null);
            if (data.member) {
                setMember(data.member);
                setForm({
                    node_color: data.member.node_color || "#10b981",
                    bio: data.member.bio || "",
                    status: data.member.status || "active",
                    joined_at: data.member.joined_at || "",
                });
                setError("");
            } else {
                setMember(null);
                setError(`Your Discord ID was not found on the roster: ${data.user?.discordId}. Please ping an Admin to get set up.`);
            }

            setLoading(false);
        };

        loadSession();

        return () => {
            mounted = false;
        };
    }, []);

    const loginWithDiscord = () => {
        setError("");
        window.location.href = "/api/auth/discord/login?returnTo=/team/profile";
    };

    const logout = async () => {
        await fetch("/api/auth/discord/logout", { method: "POST" });
        setSession(null);
        setMember(null);
    };

    const save = async () => {
        if (!member) return;
        setSaved(false);
        const res = await fetch("/api/team/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ node_color: form.node_color, bio: form.bio, status: form.status }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setError(data.error || "Profile could not be saved. Please try again.");
        } else {
            setMember(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const uploadAvatar = async (file: File) => {
        if (!member) return;
        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch("/api/team/profile", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) setError(data.error || "Avatar upload failed.");
        else setMember(data);
        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-[#040806] text-white flex flex-col selection:bg-emerald-500/30">
            <Header />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06),transparent_60%)]" />

            <div className="relative z-10 w-full px-3 sm:px-5 2xl:px-8 pt-28 pb-24">
                {/* Header */}
                <div className="flex flex-col gap-8 mb-12">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/team"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Team
                        </Link>
                        {session && (
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-all font-bold uppercase tracking-widest"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        )}
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">My Profile</h1>
                        <p className="text-gray-500 text-sm">Set your avatar, bio, and status</p>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">Loading your profile signal...</p>
                    </div>
                )}

                {/* Discord Login */}
                {!loading && !session && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-12 text-center max-w-md mx-auto mt-10 backdrop-blur-xl"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center mx-auto mb-8 border border-[#5865F2]/20 shadow-[0_0_30px_rgba(88,101,242,0.1)]">
                            <Shield size={40} className="text-[#5865F2]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Sign In with Discord</h2>
                        <p className="text-gray-400 text-sm mb-8">Connect via Discord first, then your profile unlocks.</p>
                        <button
                            onClick={loginWithDiscord}
                            className="w-full py-4 rounded-xl bg-[#5865F2] text-white font-bold hover:bg-[#4752C4] transition-all shadow-[0_0_20px_rgba(88,101,242,0.2)] flex items-center justify-center gap-3"
                        >
                            <img
                                src="https://assets-global.website-files.com/6257adef93467e5028da4f2d/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                                alt=""
                                className="w-6"
                            />
                            Discord Sync
                        </button>
                        {error && (
                            <p className="text-red-400 text-xs mt-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
                        )}
                    </motion.div>
                )}

                {/* Not Registered Error */}
                {!loading && session && !member && error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border border-red-500/10 bg-red-500/5 p-12 text-center max-w-md mx-auto mt-10 backdrop-blur-xl"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <Shield size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Not on the Roster</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
                        <Link
                            href="/team"
                            className="block w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all mb-4"
                        >
                            Back to Team
                        </Link>
                        <button
                            onClick={logout}
                            className="text-gray-600 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}

                {/* Editor */}
                {!loading && session && member && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <ProfileEditor member={member} form={form} setForm={setForm} onUploadAvatar={uploadAvatar} uploading={uploading} />

                        {/* Action Bar */}
                        <div className="mt-8 w-full max-w-2xl mx-auto">
                            <div className="bg-[#0a1a12] border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Changes ready</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AnimatePresence>
                                        {saved && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-2 text-emerald-400 text-xs font-bold mr-2"
                                            >
                                                <CheckCircle size={14} /> Profile Saved
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        onClick={save}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    >
                                        <Save size={16} /> Save profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
