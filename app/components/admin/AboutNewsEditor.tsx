"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { isUnoptimized } from "@/app/lib/media";
import type { FormattedPost } from "@/app/lib/newsPosts";
import {
    Plus,
    ExternalLink,
    Search,
    RefreshCw,
    FolderKanban,
    FileText,
    Copy,
    Check,
    Trash2,
    Loader2,
    ShieldAlert,
    Flame,
    ShieldAlert as ShieldAlertIcon,
    Sparkles,
    Newspaper,
    User,
    Radio,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const CATEGORY_OPTIONS = [
    { id: "announcement", label: "Announcement", icon: Flame, color: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
    { id: "ops", label: "Tactical Ops", icon: ShieldAlertIcon, color: "border-red-500/40 bg-red-500/10 text-red-300" },
    { id: "fleet", label: "Fleet Updates", icon: Sparkles, color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" },
    { id: "lore", label: "Org Lore", icon: Newspaper, color: "border-purple-500/40 bg-purple-500/10 text-purple-300" },
    { id: "community", label: "Community", icon: User, color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
];

export default function AboutNewsEditor() {
    const [news, setNews] = useState<FormattedPost[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    // UI & Feedback State
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
    const [searchFilter, setSearchFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const requestNews = async (): Promise<FormattedPost[]> => {
        try {
            const res = await fetch("/api/about-news");
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    };

    const fetchNews = async () => {
        setLoadingNews(true);
        setNews(await requestNews());
        setLoadingNews(false);
    };

    useEffect(() => {
        requestNews().then((list) => {
            setNews(list);
            setLoadingNews(false);
        });
    }, []);

    const handleDelete = async (id: number, dispatchTitle: string) => {
        if (!confirm(`Are you sure you want to delete dispatch "${dispatchTitle}"?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/about-news/${id}`, { method: "DELETE" });
            if (res.ok) {
                setStatus({ type: "success", message: "News dispatch deleted successfully." });
                fetchNews();
            } else {
                const data = await res.json();
                setStatus({ type: "error", message: data.error || "Failed to delete news dispatch." });
            }
        } catch {
            setStatus({ type: "error", message: "A network error occurred." });
        } finally {
            setDeletingId(null);
        }
    };

    const copyLiveLink = (id: number) => {
        const url = `${window.location.origin}/news#dispatch-${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter dispatches in admin view
    const filteredNews = useMemo(() => {
        return news.filter((item) => {
            const matchesCategory =
                categoryFilter === "all" || (item.category || "announcement").toLowerCase() === categoryFilter.toLowerCase();
            const query = searchFilter.toLowerCase().trim();
            const matchesSearch =
                !query ||
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.author_handle && item.author_handle.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [news, categoryFilter, searchFilter]);

    return (
        <div className="flex w-full flex-col gap-8 pb-24 text-white">
            {/* HEADER COMMAND BAR */}
            <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-[#050B08] p-6 shadow-2xl md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-emerald-400">
                        <Radio size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-white">
                            Dispatch Comms Hub{" "}
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-300">
                                SECURE LINK
                            </span>
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Author and manage dispatches using Payload&apos;s native visual blocks editor.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-gray-300">
                        <FileText size={14} className="text-emerald-400" />
                        <span className="font-bold text-white">{news.length}</span> Dispatches
                    </div>
                    <button
                        onClick={fetchNews}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                        title="Refresh Feed"
                    >
                        <RefreshCw size={16} className={loadingNews ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* STATUS METER */}
            {status && (
                <div
                    className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-sm font-semibold shadow-xl transition-all ${
                        status.type === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span>{status.message}</span>
                    </div>
                    <button onClick={() => setStatus(null)} className="text-xs opacity-70 hover:opacity-100">
                        ✕
                    </button>
                </div>
            )}

            {/* MASTER CREATION PANEL */}
            <div className="relative space-y-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050B08] p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] md:p-12">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent)]" />

                <div className="relative z-10 mx-auto max-w-xl space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <FolderKanban size={32} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">Create Comms Dispatch</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        Initialize Payload CMS to draft rich block layouts, drag & drop media attachments, align team authors, and compile
                        secure broadcasts.
                    </p>

                    <div className="pt-4">
                        <a
                            href="/admin/collections/news-posts/create"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 rounded-2xl bg-emerald-400 px-8 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(52,211,153,0.35)] transition-all hover:scale-[1.02] hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.5)]"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Open CMS Editor
                        </a>
                    </div>
                </div>
            </div>

            {/* DISPATCHES MANAGEMENT */}
            <div className="space-y-6 rounded-[2.5rem] border border-white/10 bg-[#050B08] p-6 shadow-2xl md:p-10">
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
                    <div>
                        <h3 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-white">
                            Manage Published Dispatches
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">Search or edit published news feed details.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 font-mono text-xs text-gray-200 outline-none focus:border-emerald-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="announcement">Announcements</option>
                            <option value="ops">Tactical Ops</option>
                            <option value="fleet">Fleet Updates</option>
                            <option value="lore">Org Lore</option>
                            <option value="community">Community</option>
                        </select>

                        <div className="relative w-full sm:w-64">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full rounded-xl border border-white/15 bg-black/60 py-2.5 pl-9 pr-3 font-mono text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {loadingNews ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16 text-emerald-400">
                        <Loader2 size={36} className="animate-spin" />
                        <span className="font-mono text-xs uppercase tracking-widest">Loading Dispatches Feed...</span>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-8 py-16 text-center text-gray-400">
                        <ShieldAlert size={40} className="mx-auto mb-3 text-gray-500" />
                        <p className="font-mono text-xs uppercase tracking-widest">No dispatches match your search filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNews.map((item) => {
                            const catKey = (item.category || "announcement").toLowerCase();
                            const catObj = CATEGORY_OPTIONS.find((c) => c.id === catKey) || CATEGORY_OPTIONS[0];

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:border-white/20 hover:bg-black/60 md:flex-row md:items-center"
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-4">
                                        {item.media_url ? (
                                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black">
                                                {item.media_type === "video" ? (
                                                    <video src={item.media_url} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Image
                                                        src={item.media_url}
                                                        alt=""
                                                        fill
                                                        sizes="80px"
                                                        unoptimized={isUnoptimized(item.media_url)}
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-mono text-[10px] text-gray-500">
                                                TEXT
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase ${catObj.color}`}
                                                >
                                                    {catObj.label}
                                                </span>
                                                <span className="font-mono text-[10px] uppercase text-gray-400">
                                                    {new Date(item.published_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                {item.author_handle && (
                                                    <span className="font-mono text-[10px] font-bold text-gray-400">
                                                        by <span className="text-white">@{item.author_handle}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="truncate text-base font-bold text-white drop-shadow">{item.title}</h4>
                                            <p className="max-w-2xl truncate text-xs text-gray-400">
                                                {item.body && typeof item.body === "string"
                                                    ? item.body
                                                    : "Structured Dispatch Content Blocks"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2 border-t border-white/10 pt-3 font-mono md:border-t-0 md:pt-0">
                                        <button
                                            onClick={() => copyLiveLink(item.id)}
                                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                                            title="Copy Live Link"
                                        >
                                            {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                            <span>{copiedId === item.id ? "Copied!" : "Link"}</span>
                                        </button>

                                        <a
                                            href={`/admin/collections/news-posts/${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20"
                                            title="Edit in CMS"
                                        >
                                            <ExternalLink size={14} /> Edit in CMS
                                        </a>

                                        <button
                                            onClick={() => handleDelete(item.id, item.title)}
                                            disabled={deletingId === item.id}
                                            className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                                            title="Delete Dispatch"
                                        >
                                            {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
