"use client";

import { Fragment, useState, useEffect, type KeyboardEvent } from "react";
import Image from "next/image";
import { isUnoptimized } from "@/app/lib/media";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Shield, Search, LogOut, RefreshCw, Award } from "lucide-react";

// Modular Components
import { ColorPicker, AddMemberModal } from "@/app/components/team/AdminComponents";
import {
    AWARD_CATEGORIES,
    AWARD_TIERS,
    CATEGORIES as CATS,
    SEC_LEVELS,
    STATUS_COLORS,
    getAwardImage,
    getRoleConfig,
    parseAwards,
    type MemberAward,
} from "@/app/components/team/teamConfig";
import type { TeamMember } from "@/payload-types";
import type { SessionResponse, SessionUser } from "@/types/session";

// Splits a comma-separated flair list
const splitFlairs = (role: string | null | undefined) =>
    (role || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

export default function AdminPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<TeamMember>>({});
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedMemberForAwards, setSelectedMemberForAwards] = useState<TeamMember | null>(null);
    const [session, setSession] = useState<SessionUser | { denied: true } | null>(null);
    const [authing, setAuthing] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const loadMembers = async () => {
        setLoading(true);
        // Admin fetches ALL members including unapproved (via ?all=1)
        const res = await window.fetch("/api/team-members?all=1", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;

        const loadAdminSession = async () => {
            setAuthing(true);
            const deniedFromRedirect = window.location.search.includes("denied=1");
            const res = await window.fetch("/api/auth/discord/session?admin=1", { cache: "no-store" });
            const data = (await res.json().catch(() => ({}))) as Partial<SessionResponse>;
            if (!mounted) return;

            if (res.ok && data?.admin) {
                setSession(data.user ?? null);
                setAuthed(true);
                await loadMembers();
            } else {
                setSession(res.status === 401 ? null : data.user || null);
                setAuthed(false);
                setMembers([]);
                setLoading(false);
                if (deniedFromRedirect) setSession(data.user || { denied: true });
            }

            if (mounted) setAuthing(false);
        };

        loadAdminSession();

        return () => {
            mounted = false;
        };
    }, []);

    const loginWithDiscord = () => {
        window.location.href = "/api/auth/discord/login?returnTo=/team/admin";
    };

    const logout = async () => {
        await window.fetch("/api/auth/discord/logout", { method: "POST" });
        setSession(null);
        setAuthed(false);
        setMembers([]);
    };

    const startEdit = (m: TeamMember) => {
        setEditId(m.id);
        setEditData({ ...m });
    };
    const cancelEdit = () => {
        setEditId(null);
        setEditData({});
    };

    const saveEdit = async () => {
        setSaving(true);
        const {
            name,
            node_color,
            role,
            category,
            status,
            bio,
            is_admin,
            avatar_url,
            joined_at,
            sec_level,
            flair_color,
            flair_icon,
            awards,
        } = editData;
        await window.fetch(`/api/team-members/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                node_color,
                role,
                category,
                status,
                bio,
                is_admin,
                avatar_url,
                joined_at,
                sec_level,
                flair_color,
                flair_icon,
                awards,
            }),
        });
        await loadMembers();
        cancelEdit();
        setSaving(false);
    };

    const remove = async (id: number) => {
        if (!confirm("Remove this member from the roster?")) return;
        await window.fetch(`/api/team-members/${id}`, { method: "DELETE" });
        await loadMembers();
    };

    const approveMember = async (id: number) => {
        await window.fetch(`/api/team-members/approve?id=${id}`, { method: "PUT" });
        await loadMembers();
    };

    const rejectMember = async (id: number) => {
        if (!confirm("Reject and remove this applicant from the system?")) return;
        await window.fetch(`/api/team-members/approve?id=${id}`, { method: "DELETE" });
        await loadMembers();
    };

    const syncDiscord = async () => {
        setSyncing(true);
        try {
            const res = await window.fetch("/api/discord/sync", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully synced ${data.synced} members!`);
                await loadMembers();
            } else {
                alert(`Sync failed: ${data.error}`);
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : err}`);
        }
        setSyncing(false);
    };

    const pendingMembers = members.filter((m) => !m.is_approved);
    const approvedMembers = members.filter((m) => m.is_approved);
    const filtered = filter
        ? approvedMembers.filter((m) => [m.name, m.role, m.category].join(" ").toLowerCase().includes(filter.toLowerCase()))
        : approvedMembers;

    if (authing) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#040806] p-6 text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <p className="font-mono text-xs uppercase tracking-widest text-gray-500">Initializing Secure Link...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#040806] p-6 text-white">
                <div className="w-full max-w-sm text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border border-emerald-500/10 bg-black/40 p-10 backdrop-blur-xl"
                    >
                        <div className="mb-8 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <Shield size={40} className="text-emerald-400" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-white">Command Center</h1>
                        <p className="mb-8 font-mono text-sm uppercase tracking-widest text-gray-500">Restricted Access</p>
                        <button
                            onClick={loginWithDiscord}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] py-4 font-bold text-white shadow-[0_0_20px_rgba(88,101,242,0.2)] transition-all hover:bg-[#4752C4]"
                        >
                            <Image
                                src="https://assets-global.website-files.com/6257adef93467e5028da4f2d/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                                alt=""
                                width={24}
                                height={24}
                                unoptimized
                                className="h-auto w-6"
                            />
                            Sign in with Discord
                        </button>
                        <Link
                            href="/team"
                            className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-white"
                        >
                            <ArrowLeft size={14} /> Return to Network
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#040806] p-6 text-white">
                <div className="w-full max-w-sm text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border border-red-500/10 bg-red-500/5 p-10 backdrop-blur-xl"
                    >
                        <div className="mb-8 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                                <Shield size={40} className="text-red-500" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-3xl font-bold text-white">Access Denied</h1>
                        <p className="mb-8 text-sm text-gray-400">
                            Identification confirmed, but administrative clearance was not found for this account.
                        </p>
                        <button
                            onClick={logout}
                            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-4 font-bold text-white transition-all hover:bg-white/5"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                        <Link
                            href="/team"
                            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 transition-colors hover:text-white"
                        >
                            <ArrowLeft size={14} /> Back to Network
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#040806] text-white selection:bg-emerald-500/30">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06),transparent_55%)]" />

            <div className="relative z-10 w-full px-4 pb-24 pt-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/team"
                            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-400"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Team
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>

                    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                                    Administrator
                                </span>
                            </div>
                            <h1 className="mb-2 text-4xl font-bold tracking-tight text-white md:text-5xl">Crew Management</h1>
                            <p className="text-sm text-gray-500">Crew roster, roles, colors, and admin settings — all managed here</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="group relative">
                                <Search
                                    size={14}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-emerald-400"
                                />
                                <input
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder="Filter personnel…"
                                    className="w-48 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all focus:w-64 focus:border-emerald-500/40"
                                />
                            </div>
                            <button
                                onClick={syncDiscord}
                                disabled={syncing}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                                {syncing ? "Syncing..." : "Discord Sync"}
                            </button>
                            <button
                                onClick={() => setShowAdd(true)}
                                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-400"
                            >
                                <Plus size={16} /> Add Member
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: "Total Crew", value: approvedMembers.length },
                        { label: "Active Crew", value: approvedMembers.filter((m) => m.status === "active").length },
                        { label: "Admin Power", value: approvedMembers.filter((m) => m.is_admin).length },
                        { label: "Pending Review", value: pendingMembers.length, highlight: pendingMembers.length > 0 },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className={`rounded-2xl border px-6 py-5 backdrop-blur-sm ${
                                s.highlight ? "border-amber-400/30 bg-amber-500/5" : "border-emerald-500/10 bg-[#040c08]/50"
                            }`}
                        >
                            <div
                                className={`mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${s.highlight ? "text-amber-400/70" : "text-gray-500"}`}
                            >
                                {s.label}
                            </div>
                            <div className={`font-mono text-3xl font-bold ${s.highlight && s.value > 0 ? "text-amber-400" : "text-white"}`}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending Crew Section */}
                {pendingMembers.length > 0 && (
                    <div className="mb-10">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-black">
                                {pendingMembers.length}
                            </div>
                            <h2 className="text-lg font-bold tracking-tight text-white">Pending Crew Requests</h2>
                            <span className="font-mono text-xs uppercase tracking-widest text-amber-400/70">Awaiting your approval</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingMembers.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-4 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-4 backdrop-blur-sm"
                                >
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border-2 border-amber-400/30">
                                        {m.avatar_url ? (
                                            <Image
                                                src={m.avatar_url}
                                                alt={m.name}
                                                width={48}
                                                height={48}
                                                unoptimized={isUnoptimized(m.avatar_url)}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-amber-500/20 text-lg font-bold text-amber-400">
                                                {m.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-bold text-white">{m.name}</div>
                                        <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400/60">
                                            {m.discord_tag}
                                        </div>
                                        <div className="mt-1 text-[10px] text-gray-500">
                                            Joined {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => approveMember(m.id)}
                                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-black transition-all hover:bg-emerald-400"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectMember(m.id)}
                                            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/10"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table Container */}
                <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#040c08]/40 shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-white/2 border-b border-white/5">
                                    {["Crew", "Role / Rank", "Status", "Frame Color", "Deployed", "Power", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="animate-pulse px-6 py-20 text-center font-mono text-xs uppercase tracking-widest text-gray-600"
                                        >
                                            Loading crew list...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-20 text-center font-mono text-xs uppercase tracking-widest text-gray-500"
                                        >
                                            No matching members found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((m) => {
                                        const isEditing = editId === m.id;
                                        const d = isEditing ? editData : m;
                                        return (
                                            <Fragment key={m.id}>
                                                <tr className="hover:bg-white/2 group transition-colors">
                                                    {/* Member */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border-2 shadow-lg"
                                                                style={{ borderColor: d.node_color || "#10b981" }}
                                                            >
                                                                {m.avatar_url ? (
                                                                    <Image
                                                                        src={m.avatar_url}
                                                                        alt={m.name}
                                                                        width={40}
                                                                        height={40}
                                                                        unoptimized={isUnoptimized(m.avatar_url)}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="flex h-full w-full items-center justify-center font-bold"
                                                                        style={{ background: d.node_color || "#10b981", color: "#040806" }}
                                                                    >
                                                                        {m.name?.[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                {isEditing ? (
                                                                    <div className="space-y-2">
                                                                        <div className="font-bold tracking-tight text-white">{m.name}</div>
                                                                        <input
                                                                            value={d.avatar_url || ""}
                                                                            onChange={(e) =>
                                                                                setEditData((p) => ({ ...p, avatar_url: e.target.value }))
                                                                            }
                                                                            className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                                                                            placeholder="Avatar URL"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-bold tracking-tight text-white">{m.name}</div>
                                                                        <div className="font-mono text-[10px] text-gray-600">
                                                                            {m.discord_tag || "DISCORD_N/A"}
                                                                        </div>
                                                                        {m.bio ? (
                                                                            <div
                                                                                className="mt-1 line-clamp-2 max-w-xs border-l border-emerald-500/30 pl-2 text-[11px] italic text-gray-400"
                                                                                title={m.bio}
                                                                            >
                                                                                &ldquo;{m.bio}&rdquo;
                                                                            </div>
                                                                        ) : (
                                                                            <div className="mt-0.5 text-[10px] italic text-gray-600">
                                                                                No bio set
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role / Cat */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <div className="min-w-[200px] space-y-2">
                                                                {/* Multiple Flairs Pills */}
                                                                <div className="flex min-h-[46px] max-w-[220px] flex-wrap items-center gap-1 rounded-lg border border-emerald-500/20 bg-white/5 p-2">
                                                                    {(d.role || "")
                                                                        .split(",")
                                                                        .map((r) => r.trim())
                                                                        .filter(Boolean)
                                                                        .map((flair) => {
                                                                            const { accent: flairAccent } = getRoleConfig(flair);
                                                                            const currentAccent = flairAccent || "#10b981";
                                                                            return (
                                                                                <span
                                                                                    key={flair}
                                                                                    className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                                                                                    style={{
                                                                                        color: currentAccent,
                                                                                        borderColor: `${currentAccent}30`,
                                                                                        background: `${currentAccent}10`,
                                                                                    }}
                                                                                >
                                                                                    {flair}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const remaining = (d.role || "")
                                                                                                .split(",")
                                                                                                .map((x) => x.trim())
                                                                                                .filter((x) => x !== flair)
                                                                                                .join(", ");
                                                                                            setEditData((p) => ({ ...p, role: remaining }));
                                                                                        }}
                                                                                        className="ml-1 cursor-pointer font-bold transition-colors hover:text-red-400"
                                                                                    >
                                                                                        &times;
                                                                                    </button>
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    {(d.role || "")
                                                                        .split(",")
                                                                        .map((r) => r.trim())
                                                                        .filter(Boolean).length === 0 && (
                                                                        <span className="text-[10px] italic text-gray-500">No flairs</span>
                                                                    )}
                                                                </div>

                                                                <div className="flex gap-1.5">
                                                                    <input
                                                                        type="text"
                                                                        id={`edit-flair-input-${m.id}`}
                                                                        placeholder="New..."
                                                                        className="flex-1 rounded-lg border border-emerald-500/20 bg-white/5 px-2.5 py-1 text-xs text-white outline-none focus:border-emerald-500/40"
                                                                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                                                            if (e.key === "Enter") {
                                                                                e.preventDefault();
                                                                                const val = e.currentTarget.value.trim();
                                                                                if (val) {
                                                                                    const current = splitFlairs(d.role);
                                                                                    if (!current.includes(val)) {
                                                                                        setEditData((p) => ({
                                                                                            ...p,
                                                                                            role: [...current, val].join(", "),
                                                                                        }));
                                                                                    }
                                                                                    e.currentTarget.value = "";
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const input = document.getElementById(
                                                                                `edit-flair-input-${m.id}`,
                                                                            ) as HTMLInputElement | null;
                                                                            const val = input?.value.trim();
                                                                            if (input && val) {
                                                                                const current = splitFlairs(d.role);
                                                                                if (!current.includes(val)) {
                                                                                    setEditData((p) => ({
                                                                                        ...p,
                                                                                        role: [...current, val].join(", "),
                                                                                    }));
                                                                                }
                                                                                input.value = "";
                                                                            }
                                                                        }}
                                                                        className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/30"
                                                                    >
                                                                        + Add
                                                                    </button>
                                                                </div>
                                                                <div className="mt-1.5 flex items-center gap-1.5">
                                                                    <ColorPicker
                                                                        value={d.flair_color || "#10b981"}
                                                                        onChange={(c) => setEditData((p) => ({ ...p, flair_color: c }))}
                                                                    />
                                                                    <select
                                                                        value={d.flair_icon || "zap"}
                                                                        onChange={(e) =>
                                                                            setEditData((p) => ({
                                                                                ...p,
                                                                                flair_icon: e.target.value as TeamMember["flair_icon"],
                                                                            }))
                                                                        }
                                                                        className="rounded-lg border border-emerald-500/20 bg-white/5 px-2 py-1 text-[10px] text-white outline-none"
                                                                    >
                                                                        {[
                                                                            "crown",
                                                                            "shield",
                                                                            "sword",
                                                                            "users",
                                                                            "zap",
                                                                            "terminal",
                                                                            "none",
                                                                        ].map((o) => (
                                                                            <option key={o} value={o} className="bg-[#0a1a12]">
                                                                                {o}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <select
                                                                    value={d.category ?? ""}
                                                                    onChange={(e) =>
                                                                        setEditData((p) => ({
                                                                            ...p,
                                                                            category: e.target.value as TeamMember["category"],
                                                                        }))
                                                                    }
                                                                    className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                                                                >
                                                                    {CATS.map((c) => (
                                                                        <option key={c} value={c} className="bg-[#0a1a12]">
                                                                            {c}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    value={
                                                                        d.sec_level && SEC_LEVELS.includes(d.sec_level) ? d.sec_level : "R0"
                                                                    }
                                                                    onChange={(e) =>
                                                                        setEditData((p) => ({
                                                                            ...p,
                                                                            sec_level: e.target.value as TeamMember["sec_level"],
                                                                        }))
                                                                    }
                                                                    className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                                                                >
                                                                    {SEC_LEVELS.map((s) => (
                                                                        <option key={s} value={s} className="bg-[#0a1a12]">
                                                                            {s}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex max-w-[150px] flex-wrap gap-1">
                                                                    {(m.role || "KMHQ")
                                                                        .split(",")
                                                                        .map((r) => r.trim())
                                                                        .filter(Boolean)
                                                                        .map((flair) => (
                                                                            <span
                                                                                key={flair}
                                                                                className="rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                                                                                style={{
                                                                                    color: m.flair_color || "#10b981",
                                                                                    borderColor: (m.flair_color || "#10b981") + "25",
                                                                                    background: (m.flair_color || "#10b981") + "12",
                                                                                }}
                                                                            >
                                                                                {flair}
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                                <div className="mt-1.5 text-[10px] uppercase tracking-widest text-gray-600">
                                                                    {m.category}
                                                                </div>
                                                                <div className="mt-0.5 font-mono text-[9px] text-gray-500">
                                                                    SEC:{" "}
                                                                    {m.sec_level && SEC_LEVELS.includes(m.sec_level) ? m.sec_level : "R0"}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <select
                                                                value={d.status ?? ""}
                                                                onChange={(e) =>
                                                                    setEditData((p) => ({
                                                                        ...p,
                                                                        status: e.target.value as TeamMember["status"],
                                                                    }))
                                                                }
                                                                className="rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                                                            >
                                                                {["active", "inactive"].map((s) => (
                                                                    <option key={s} value={s} className="bg-[#0a1a12]">
                                                                        {s}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{
                                                                        background: STATUS_COLORS[m.status ?? ""] || STATUS_COLORS.inactive,
                                                                        boxShadow: `0 0 10px ${STATUS_COLORS[m.status ?? ""] || STATUS_COLORS.inactive}`,
                                                                    }}
                                                                />
                                                                <span className="text-xs font-medium capitalize text-gray-400">
                                                                    {m.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Node Color */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-3">
                                                                <ColorPicker
                                                                    value={d.node_color || "#10b981"}
                                                                    onChange={(c) => setEditData((p) => ({ ...p, node_color: c }))}
                                                                />
                                                                <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white">
                                                                    {d.node_color}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="h-6 w-6 rounded-lg border border-white/10"
                                                                    style={{ background: m.node_color || "#10b981" }}
                                                                />
                                                                <span className="font-mono text-xs text-gray-600">{m.node_color}</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Deployed */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                value={
                                                                    d.joined_at
                                                                        ? (() => {
                                                                              try {
                                                                                  return new Date(d.joined_at).toISOString().split("T")[0];
                                                                              } catch {
                                                                                  return "";
                                                                              }
                                                                          })()
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    setEditData((p) => ({
                                                                        ...p,
                                                                        joined_at: e.target.value
                                                                            ? new Date(e.target.value + "T12:00:00Z").toISOString()
                                                                            : null,
                                                                    }))
                                                                }
                                                                className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                                                            />
                                                        ) : (
                                                            <span className="font-mono text-xs text-gray-400">
                                                                {(() => {
                                                                    try {
                                                                        return d.joined_at
                                                                            ? new Date(d.joined_at).toLocaleDateString("en-US", {
                                                                                  year: "numeric",
                                                                                  month: "short",
                                                                                  day: "numeric",
                                                                              })
                                                                            : "N/A";
                                                                    } catch {
                                                                        return "N/A";
                                                                    }
                                                                })()}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Admin toggle */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <label className="relative inline-flex cursor-pointer items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(d.is_admin)}
                                                                    onChange={(e) =>
                                                                        setEditData((p) => ({ ...p, is_admin: e.target.checked }))
                                                                    }
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="peer h-6 w-11 rounded-full bg-white/5 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-gray-500 after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-black peer-focus:outline-none rtl:peer-checked:after:-translate-x-full"></div>
                                                            </label>
                                                        ) : (
                                                            <span className={m.is_admin ? "text-emerald-400" : "text-gray-700"}>
                                                                <Shield
                                                                    size={18}
                                                                    fill={m.is_admin ? "currentColor" : "none"}
                                                                    className="opacity-40"
                                                                />
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-5">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={saveEdit}
                                                                    disabled={saving}
                                                                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                                                                >
                                                                    <Save size={14} /> {saving ? "..." : "Commit"}
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                                                                >
                                                                    <X size={14} /> Abort
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setSelectedMemberForAwards(m)}
                                                                    className="rounded-xl border border-yellow-500/10 p-2 text-yellow-500 transition-all hover:bg-yellow-500/10"
                                                                    title="Manage Awards"
                                                                >
                                                                    <Award size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => startEdit(m)}
                                                                    className="rounded-xl border border-emerald-500/10 p-2 text-emerald-500 transition-all hover:bg-emerald-500/10"
                                                                    title="Edit Record"
                                                                >
                                                                    <Edit3 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => remove(m.id)}
                                                                    className="rounded-xl border border-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/10"
                                                                    title="Delete Record"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isEditing && (
                                                    <tr className="border-b border-emerald-500/20 bg-emerald-500/[0.03]">
                                                        <td colSpan={7} className="px-6 py-4">
                                                            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/20 bg-[#040c08]/90 p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                                                                        <span>Biography / Bio Box</span>
                                                                    </label>
                                                                    <span className="font-mono text-[10px] text-gray-500">
                                                                        Changes will be committed on Save
                                                                    </span>
                                                                </div>
                                                                <textarea
                                                                    value={d.bio || ""}
                                                                    onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
                                                                    rows={3}
                                                                    className="w-full resize-y rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-3 font-sans text-xs leading-relaxed text-white outline-none transition-colors focus:border-emerald-500/40"
                                                                    placeholder="Write or edit member biography / bio box..."
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AnimatePresence>{showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onAdded={loadMembers} />}</AnimatePresence>
            <AnimatePresence>
                {selectedMemberForAwards && (
                    <ManageAwardsModal
                        member={selectedMemberForAwards}
                        onClose={() => setSelectedMemberForAwards(null)}
                        onUpdated={loadMembers}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

interface ManageAwardsModalProps {
    member: TeamMember;
    onClose: () => void;
    onUpdated: () => void;
}

function ManageAwardsModal({ member, onClose, onUpdated }: ManageAwardsModalProps) {
    const [awards, setAwards] = useState<MemberAward[]>(() => parseAwards(member.awards));
    const [category, setCategory] = useState("Shaqafat");
    const [tier, setTier] = useState("Ustad");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const addAward = () => {
        const exists = awards.some((a) => a.category === category && a.tier === tier);
        if (exists) {
            setError("This award/tier is already assigned to this member.");
            return;
        }
        setError("");
        setAwards((prev) => [...prev, { category, tier }]);
    };

    const removeAward = (index: number) => {
        setAwards((prev) => prev.filter((_, i) => i !== index));
    };

    const save = async () => {
        setSaving(true);
        setError("");
        const res = await window.fetch(`/api/team-members/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ awards }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to update awards.");
            setSaving(false);
            return;
        }

        onUpdated();
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-500/20 bg-[#0a1a12] p-8 shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white">Manage Awards</h3>
                        <p className="mt-1 text-xs text-gray-500">{member.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 transition-colors hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Current Awards List */}
                <div className="mb-8">
                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Currently Assigned</label>
                    {awards.length === 0 ? (
                        <p className="bg-white/2 rounded-xl border border-white/5 p-4 text-center text-sm italic text-gray-600">
                            No awards assigned yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {awards.map((a, i) => {
                                const img = getAwardImage(a.category, a.tier);
                                return (
                                    <div
                                        key={i}
                                        className="bg-white/2 flex items-center justify-between rounded-xl border border-white/5 p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            {img && <Image src={img} alt="" width={40} height={40} className="h-10 w-10 object-contain" />}
                                            <div>
                                                <div className="text-sm font-bold text-white">{a.category}</div>
                                                <div className="text-xs text-emerald-400">{a.tier}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAward(i)}
                                            className="rounded-xl p-2 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
                                            title="Remove Award"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add Award Section */}
                <div className="mb-8 border-t border-white/5 pt-6">
                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Assign New Award</label>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-600">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
                            >
                                {Object.keys(AWARD_CATEGORIES).map((cat) => (
                                    <option key={cat} value={cat} className="bg-[#0a1a12]">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-600">Tier</label>
                            <select
                                value={tier}
                                onChange={(e) => setTier(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
                            >
                                {Object.keys(AWARD_TIERS).map((t) => (
                                    <option key={t} value={t} className="bg-[#0a1a12]">
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={addAward}
                        className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/20"
                    >
                        Assign Badge
                    </button>
                </div>

                {error && <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{error}</p>}

                {/* Footer Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Commit Changes"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
