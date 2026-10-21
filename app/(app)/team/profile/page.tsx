"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle, LogOut, Shield } from "lucide-react";
import Header from "@/app/components/Header";
import ProfileEditor, { type ProfileForm } from "@/app/components/team/ProfileEditor";
import type { TeamMember } from "@/payload-types";
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
        <div className="flex min-h-screen flex-col bg-[#040806] text-white selection:bg-emerald-500/30">
            <Header />
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.06),transparent_60%)]" />

            <div className="relative z-10 w-full px-3 pb-24 pt-28 sm:px-5 2xl:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/team"
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-400"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Team
                        </Link>
                        {session && (
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 transition-all hover:text-red-400"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        )}
                    </div>

                    <div>
                        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white md:text-5xl">My Profile</h1>
                        <p className="text-sm text-gray-500">Set your avatar, bio, and status</p>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">Loading your profile signal...</p>
                    </div>
                )}

                {/* Discord Login */}
                {!loading && !session && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto mt-10 max-w-md rounded-3xl border border-white/5 bg-[#040c08]/40 p-12 text-center backdrop-blur-xl"
                    >
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/10 shadow-[0_0_30px_rgba(88,101,242,0.1)]">
                            <Shield size={40} className="text-[#5865F2]" />
                        </div>
                        <h2 className="mb-3 text-2xl font-bold text-white">Sign In with Discord</h2>
                        <p className="mb-8 text-sm text-gray-400">Connect via Discord first, then your profile unlocks.</p>
                        <button
                            onClick={loginWithDiscord}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-4 font-bold text-white shadow-[0_0_20px_rgba(88,101,242,0.2)] transition-all hover:bg-[#4752C4]"
                        >
                            <img
                                src="https://assets-global.website-files.com/6257adef93467e5028da4f2d/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                                alt=""
                                className="w-6"
                            />
                            Discord Sync
                        </button>
                        {error && (
                            <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">{error}</p>
                        )}
                    </motion.div>
                )}

                {/* Not Registered Error */}
                {!loading && session && !member && error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto mt-10 max-w-md rounded-3xl border border-red-500/10 bg-red-500/5 p-12 text-center backdrop-blur-xl"
                    >
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                            <Shield size={40} className="text-red-500" />
                        </div>
                        <h2 className="mb-3 text-2xl font-bold text-white">Not on the Roster</h2>
                        <p className="mb-8 text-sm leading-relaxed text-gray-400">{error}</p>
                        <Link
                            href="/team"
                            className="mb-4 block w-full rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-white transition-all hover:bg-white/10"
                        >
                            Back to Team
                        </Link>
                        <button
                            onClick={logout}
                            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition-colors hover:text-white"
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
                        <div className="mx-auto mt-8 w-full max-w-2xl">
                            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-[#0a1a12] p-6 shadow-2xl sm:flex-row sm:gap-0">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Changes ready</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AnimatePresence>
                                        {saved && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="mr-2 flex items-center gap-2 text-xs font-bold text-emerald-400"
                                            >
                                                <CheckCircle size={14} /> Profile Saved
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        onClick={save}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400"
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
