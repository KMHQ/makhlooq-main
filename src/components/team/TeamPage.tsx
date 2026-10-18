"use client";

import { createElement, useState, useEffect, useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, X, ChevronRight, Activity, Plus, LogIn, Terminal, WifiOff, Clock, LogOut, RefreshCw } from "lucide-react";
import type { TeamMember } from "@/types/db";
import type { SessionResponse, SessionUser } from "@/types/session";
import type { PageData } from "@/lib/payload/queries";
import ProfileEditor, { type ProfileForm } from "./ProfileEditor";
import RanksRolesChart from "./RanksRolesChart";
import ProfileModal from "./ProfileModal";
import { AddMemberModal } from "./AdminComponents";
import { CATEGORIES, RANK_ORDER, STATUS_META, formatDate, getAwardImage, getFlairIcon, getRoleConfig, parseAwards } from "./teamConfig";

// ============================================================
// MEMBER CARD
// ============================================================

const MemberCard = ({ member, onClick }: { member: TeamMember; onClick: (member: TeamMember) => void }) => {
    const { accent: fallbackAccent } = getRoleConfig(member.role);
    const accent = member.flair_color || fallbackAccent || "#10b981";
    const frameColor = member.node_color || accent;
    const status = STATUS_META[member.status ?? ""] || STATUS_META.inactive;
    const awards = parseAwards(member.awards);
    const initial = member.name?.[0]?.toUpperCase() || "?";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onClick(member)}
            className="group cursor-pointer relative overflow-hidden rounded-[2rem] border border-lime-300/10 bg-white/[0.03] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(4,12,5,0.86) 52%, rgba(2,5,3,0.94) 100%)",
                fontFamily: "Inter, system-ui, sans-serif",
                transition: "border-color 0.2s",
            }}
            whileHover={{
                y: -8,
                scale: 1.015,
                borderColor: frameColor,
                boxShadow: `0 34px 100px rgba(0,0,0,0.45), 0 0 42px ${frameColor}22`,
                transition: { duration: 0.18 },
            }}
        >
            {/* Top accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: `linear-gradient(90deg, transparent, ${frameColor}, transparent)` }}
            />

            {/* Scanlines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,#00000012 3px,#00000012 4px)" }}
            />

            {/* Corner accents */}
            {[
                "top-0 left-0 border-t border-l",
                "top-0 right-0 border-t border-r",
                "bottom-0 left-0 border-b border-l",
                "bottom-0 right-0 border-b border-r",
            ].map((c, i) => (
                <div
                    key={i}
                    className={`absolute w-3 h-3 ${c} opacity-0 group-hover:opacity-100 transition-all duration-200`}
                    style={{ borderColor: frameColor }}
                />
            ))}

            {/* Glitch bar */}
            <div
                className="absolute right-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: frameColor, animation: "bar-flicker 0.5s steps(3) infinite" }}
            />

            <div className="relative p-6">
                {/* Header row */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                        <span className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: status.color }}>
                            {status.label}
                        </span>
                    </div>
                    <span className="font-mono text-[9px] tracking-normal text-lime-200/25 uppercase">
                        {member.discord_uid || "--------"}
                    </span>
                </div>

                {/* Avatar + Name */}
                <div className="mb-5 flex items-start gap-4">
                    <div
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden text-2xl font-black"
                        style={{
                            background: `${frameColor}15`,
                            border: `1px solid ${frameColor}40`,
                            clipPath: "polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))",
                            color: frameColor,
                        }}
                    >
                        {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="group-hover:animate-[text-glitch_0.6s_steps(1)_infinite]">{initial}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-lime-200">
                            {member.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {(member.role || "KMHQ")
                                .split(",")
                                .map((r) => r.trim())
                                .filter(Boolean)
                                .map((flair, idx) => {
                                    const { Icon: flairIcon, accent: flairAccent } = getRoleConfig(flair);
                                    const showIcon = idx === 0 ? (getFlairIcon(member.flair_icon, flairIcon) ?? flairIcon) : flairIcon;
                                    const currentAccent = member.flair_color || flairAccent || "#10b981";
                                    return (
                                        <span
                                            key={flair}
                                            className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                                            style={{
                                                color: currentAccent,
                                                background: `${currentAccent}12`,
                                                borderColor: `${currentAccent}30`,
                                            }}
                                        >
                                            {createElement(showIcon, { size: 10 })}
                                            {flair}
                                        </span>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Awards list preview */}
                {awards.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {awards.map((award, i) => {
                            const imgUrl = getAwardImage(award.category, award.tier);
                            const title = `${award.category} - ${award.tier}`;
                            return imgUrl ? (
                                <img
                                    key={i}
                                    src={imgUrl}
                                    alt={title}
                                    title={title}
                                    className="w-7 h-7 object-contain opacity-75 group-hover:opacity-100 transition-opacity drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                                />
                            ) : null;
                        })}
                    </div>
                )}

                {/* Bio */}
                {member.bio && (
                    <p className="mb-5 line-clamp-3 border-l-2 border-lime-300/20 pl-3 font-mono text-sm leading-relaxed text-lime-100/45 transition-colors group-hover:border-lime-300/45 group-hover:text-lime-50/70">
                        {member.bio}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-1 flex items-center justify-between border-t border-lime-300/10 pt-4 font-mono text-[11px] tracking-[0.16em] text-lime-100/35 group-hover:border-lime-300/25">
                    <span className="uppercase text-lime-100/50">{member.category || "Makhlooq"}</span>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDate(member.joined_at)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================
// FILTER BAR
// ============================================================

interface FilterBarProps {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    statusFilter: string;
    setStatusFilter: Dispatch<SetStateAction<string>>;
    categoryFilter: string;
    setCategoryFilter: Dispatch<SetStateAction<string>>;
}

const FilterBar = ({ search, setSearch, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter }: FilterBarProps) => (
    <div className="grid gap-4 rounded-[2rem] border border-lime-300/10 bg-black/35 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:grid-cols-[1.7fr_1fr_1fr]">
        <div className="space-y-2">
            <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Crew Search</label>
            <div className="relative group">
                <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-100/30 transition-colors group-focus-within:text-lime-200/70"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter name, tag or bio..."
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] py-4 pl-12 pr-4 text-base text-white transition-all placeholder:text-white/25 focus:border-lime-300/35 focus:bg-lime-300/[0.055] focus:outline-none"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Status</label>
            <div className="flex bg-white/[0.035] border border-white/10 rounded-2xl p-1 h-[58px]">
                {["all", "active", "inactive"].map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`flex-1 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.12em] transition-all cursor-pointer ${
                            statusFilter === status
                                ? "bg-lime-300 text-[#020402] shadow-[0_0_10px_rgba(163,230,53,0.2)]"
                                : "text-lime-100/40 hover:text-white"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-2">
            <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Rank</label>
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-base text-white transition-all hover:bg-lime-300/[0.055] focus:border-lime-300/35 focus:outline-none"
            >
                <option value="" className="bg-[#0a0a0a]">
                    All Ranks
                </option>
                <optgroup label="Categories" className="bg-[#0a0a0a] text-lime-400 font-bold">
                    <option value="group:commanders" className="bg-[#0a0a0a] text-white">
                        Commanders (C1-C3)
                    </option>
                    <option value="group:officers" className="bg-[#0a0a0a] text-white">
                        Officers (O1-O5)
                    </option>
                    <option value="group:enlists" className="bg-[#0a0a0a] text-white">
                        Enlists (E1-E5)
                    </option>
                </optgroup>
                <optgroup label="Individual Ranks" className="bg-[#0a0a0a] text-lime-400 font-bold">
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">
                            {cat}
                        </option>
                    ))}
                </optgroup>
            </select>
        </div>
    </div>
);

// ProfileModal is imported from ./ProfileModal

// ============================================================
// JOIN CTA
// ============================================================

const JoinCommunityCTA = ({ joinCTA = {} }: { joinCTA?: PageData<"team-page">["joinCTA"] }) => (
    <section className="relative mt-20 overflow-hidden">
        <div className="relative p-12 text-center overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                    {joinCTA.badge || "Recruitment Open"}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white max-w-2xl">
                    {joinCTA.heading ? (
                        joinCTA.heading.includes("Khalai Makhlooq") ? (
                            <>
                                {joinCTA.heading.split("Khalai Makhlooq")[0]}
                                <span className="text-white/40 font-light italic">Khalai Makhlooq</span>
                                {joinCTA.heading.split("Khalai Makhlooq")[1]}
                            </>
                        ) : (
                            joinCTA.heading
                        )
                    ) : (
                        <>
                            Join <span className="text-white/40 font-light italic">Khalai Makhlooq</span>&apos;s space crew
                        </>
                    )}
                </h2>
                <p className="text-white/40 text-sm max-w-lg font-medium leading-relaxed">
                    {joinCTA.description || "Join the crew, see the ships, and grow your rank through organized action."}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <a
                        href={joinCTA.discordLink || "https://discord.gg/K7SfxPSwXk"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                        {joinCTA.discordLinkText || "Join on Discord"} <ChevronRight size={16} />
                    </a>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                        {joinCTA.learnMoreText || "Learn More"}
                    </button>
                </div>
            </div>
        </div>
    </section>
);

// ============================================================
// EDIT PROFILE MODAL
// ============================================================

const toProfileForm = (m: Partial<TeamMember>): ProfileForm => ({
    node_color: m.node_color || "#10b981",
    bio: m.bio || "",
    status: m.status || "active",
    joined_at: m.joined_at || "",
    is_admin: Boolean(m.is_admin),
});

interface EditProfileModalProps {
    member: TeamMember;
    onClose: () => void;
    onUpdated: (member: TeamMember) => void;
}

const EditProfileModal = ({ member, onClose, onUpdated }: EditProfileModalProps) => {
    const [form, setForm] = useState(() => toProfileForm(member));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        setSaving(true);
        const res = await fetch("/api/team/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ node_color: form.node_color, bio: form.bio, status: form.status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.error || "Failed to update dossier.");
            setSaving(false);
            return;
        }
        onUpdated(data);
        onClose();
    };

    const uploadAvatar = async (file: File) => {
        setUploading(true);
        setError("");

        // Client-side size check (20MB)
        if (file.size > 20971520) {
            setError("Avatar file size cannot exceed 20MB.");
            setUploading(false);
            return;
        }

        // Client-side mimetype check
        const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedMimes.includes(file.type)) {
            setError("Only JPG, PNG, WEBP, and GIF images are allowed.");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch("/api/team/profile", { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.error || "Avatar upload failed.");
        } else {
            setForm(toProfileForm(data));
            onUpdated(data);
        }
        setUploading(false);
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: "rgba(2,13,5,0.95)" }}
        >
            <motion.div
                className="w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                style={{ background: "#020d05", border: "1px solid #0f5c1e", borderRadius: "24px" }}
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-emerald-500" />
                        <span className="font-mono text-xs tracking-[0.3em] text-emerald-500 uppercase font-bold">Edit Profile</span>
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <ProfileEditor member={member} form={form} setForm={setForm} onUploadAvatar={uploadAvatar} uploading={uploading} />

                    {error && (
                        <div className="mt-6 font-mono text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all font-mono tracking-wider"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={save}
                            disabled={saving || uploading}
                            className="flex-[2] py-4 bg-emerald-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50 font-mono tracking-wider"
                        >
                            {saving ? "UPDATING DOSSIER…" : "SAVE CHANGES"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function TeamPage({ pageData }: { pageData: PageData<"team-page"> | null }) {
    const kicker = pageData?.kicker || "Crew Network";
    const headingLine1 = pageData?.headingLine1 || "Team";
    const headingLine2 = pageData?.headingLine2 || "Scene";
    const description =
        pageData?.description ||
        "The roster wall, but not the boring kind. Pilots, officers, and crew — all here in clean cards with full style.";
    const accessCard = pageData?.accessCard || {};
    const briefing = pageData?.briefing || {};
    const joinCTA = pageData?.joinCTA || {};

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [session, setSession] = useState<SessionUser | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const [currentUserMember, setCurrentUserMember] = useState<TeamMember | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "network">("grid");
    const [syncing, setSyncing] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            // Public API — returns only approved members
            const res = await fetch("/api/team-members", { cache: "no-store" });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setFetchError(data?.error || "Failed to establish connection with the central database.");
                setMembers([]);
            } else {
                setMembers(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch members:", err);
            setFetchError("Network communication error. Check your connection to the grid.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();

        fetch("/api/auth/discord/session", { cache: "no-store" })
            .then((res) => res.json())
            .then((data: SessionResponse & { error?: string }) => {
                if (data?.authenticated) {
                    setSession(data.user ?? null);
                    // The session endpoint also returns the member profile (even if unapproved)
                    if (data.member) setCurrentUserMember(data.member);
                    setAuthError(null);
                } else {
                    setSession(null);
                    setCurrentUserMember(null);
                    if (data?.error) setAuthError(data.error);
                }
            })
            .catch((err) => {
                console.error("Auth error:", err);
                setSession(null);
                setCurrentUserMember(null);
                setAuthError("Authentication service unreachable.");
            });
    }, [fetchMembers]);

    const loginWithDiscord = () => {
        window.location.href = "/api/auth/discord/login?returnTo=/team";
    };

    const logout = async () => {
        await fetch("/api/auth/discord/logout", { method: "POST" });
        setSession(null);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch("/api/discord/sync", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                alert(`Successfully synced ${data.synced} members!`);
                fetchMembers();
            } else {
                alert(`Sync failed: ${data.error || "Unknown error"}`);
            }
        } catch (err) {
            alert(`Error during sync: ${err instanceof Error ? err.message : err}`);
        } finally {
            setSyncing(false);
        }
    };

    const isAdmin = Boolean(currentUserMember?.is_admin) || session?.source === "env";

    const filteredMembers = useMemo(() => {
        let f = [...members];
        if (search) {
            const q = search.toLowerCase();
            f = f.filter(
                (m) => m.name?.toLowerCase().includes(q) || m.discord_tag?.toLowerCase().includes(q) || m.bio?.toLowerCase().includes(q),
            );
        }

        // Status filter: all, active, inactive
        if (statusFilter === "active") {
            f = f.filter((m) => m.status === "active");
        } else if (statusFilter === "inactive") {
            f = f.filter((m) => m.status === "inactive");
        }

        // Rank category/individual filter
        if (categoryFilter) {
            if (categoryFilter === "group:commanders") {
                const commanders = ["Field Marshal", "General", "Commander"];
                f = f.filter((m) => commanders.includes(m.category ?? ""));
            } else if (categoryFilter === "group:officers") {
                const officers = ["Colonel", "Major", "Captain", "Officer", "Lieutenant"];
                f = f.filter((m) => officers.includes(m.category ?? ""));
            } else if (categoryFilter === "group:enlists") {
                const enlists = ["Sergeant", "Corporal", "Soldier", "Citizen", "Makhlooq"];
                f = f.filter((m) => enlists.includes(m.category ?? ""));
            } else {
                f = f.filter((m) => m.category === categoryFilter);
            }
        }

        // Default sort: rank high to low, then active first, then name alphabetical
        f.sort((a, b) => {
            // Primary sort: military rank (RANK_ORDER: Field Marshal (1) -> Makhlooq (13))
            const ra = RANK_ORDER[a.category ?? ""] || 99,
                rb = RANK_ORDER[b.category ?? ""] || 99;
            if (ra !== rb) return ra - rb;

            // Secondary sort: status (active first)
            const sa = a.status === "active" ? 0 : 1;
            const sb = b.status === "active" ? 0 : 1;
            if (sa !== sb) return sa - sb;

            // Tertiary sort: alphabetical name
            return (a.name || "").localeCompare(b.name || "");
        });
        return f;
    }, [members, search, statusFilter, categoryFilter]);

    const onlineCount = members.filter((m) => m.status === "active").length;

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-[#020402] text-white selection:bg-lime-300/30"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(163,230,53,0.12),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_25%,transparent_75%,rgba(0,0,0,0.7))]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(163,230,53,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.08)_1px,transparent_1px)] [background-size:78px_78px]" />

            <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-5 2xl:px-8">
                {/* ── HEADER ── */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-end"
                >
                    <div>
                        <div className="font-mono text-sm font-black uppercase tracking-[0.4em] text-lime-300/55">{kicker}</div>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 sm:gap-x-5 leading-none tracking-[-0.09em]">
                            <span className="text-[12vw] font-black uppercase text-transparent [-webkit-text-stroke:1px_rgba(217,249,157,0.28)] md:text-[5rem] lg:text-[6rem]">
                                {headingLine1}
                            </span>
                            <span className="text-[12vw] font-black uppercase text-white md:text-[5rem] lg:text-[6rem]">
                                {headingLine2}
                            </span>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-snug text-white/40">{description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-lime-100/40">
                            <span>{members.length} personnel</span>
                            <span className="h-1 w-1 rounded-full bg-lime-300/30" />
                            <span className="text-lime-300/70">{onlineCount} active</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-lime-300/10 bg-white/[0.035] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-black uppercase tracking-[0.34em] text-lime-300/50">
                                    {accessCard.kicker || "Crew Access"}
                                </div>
                                <div className="mt-1 text-xl font-black tracking-[-0.05em] text-white">
                                    {accessCard.heading || "Scene Live"}
                                </div>
                            </div>
                            <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-lime-200">
                                {accessCard.badge || "Live"}
                            </div>
                        </div>
                        <p className="mt-2 max-w-md text-xs leading-relaxed text-white/40">
                            {accessCard.description ||
                                "Entry is through Discord, then you set up your profile. Admins get extra tools; otherwise, chill mode."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {session ? (
                                <>
                                    {currentUserMember && (
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10 active:scale-95"
                                        >
                                            <User size={13} /> My Profile
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={() => setShowAddModal(true)}
                                                className="flex items-center gap-2 rounded-xl bg-lime-300 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-lime-200 active:scale-95"
                                            >
                                                <Plus size={13} /> Add Member
                                            </button>
                                            <button
                                                onClick={handleSync}
                                                disabled={syncing}
                                                className="flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-300 transition-all hover:bg-lime-300/25 active:scale-95 disabled:opacity-50"
                                            >
                                                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                                                {syncing ? "Syncing..." : "Sync Members"}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-300 transition-all hover:bg-red-500/20 active:scale-95"
                                    >
                                        <LogOut size={13} /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={loginWithDiscord}
                                    className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-[#4752C4] active:scale-95"
                                >
                                    <LogIn size={14} /> Sign In with Discord
                                </button>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Filters */}
                <div className="mt-6 mb-4 flex flex-col xl:flex-row xl:items-end gap-6 justify-between">
                    <div className="flex-1 min-w-0">
                        <FilterBar
                            search={search}
                            setSearch={setSearch}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                        />
                    </div>
                    <div className="flex-shrink-0 flex items-center bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-[1.25rem] p-1 self-start xl:self-auto">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                                viewMode === "grid"
                                    ? "bg-lime-300 text-[#020402] shadow-[0_0_15px_rgba(163,230,53,0.25)]"
                                    : "text-lime-100/40 hover:text-white"
                            }`}
                        >
                            Roster Wall
                        </button>
                        <button
                            onClick={() => setViewMode("network")}
                            className={`px-5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                                viewMode === "network"
                                    ? "bg-lime-300 text-[#020402] shadow-[0_0_15px_rgba(163,230,53,0.25)]"
                                    : "text-lime-100/40 hover:text-white"
                            }`}
                        >
                            Ranks & Roles
                        </button>
                    </div>
                </div>

                {/* Pending Self-Banner: show only to the logged-in user who hasn't been approved yet */}
                {session && currentUserMember && !currentUserMember.is_approved && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center gap-5 rounded-[1.75rem] border border-amber-400/20 bg-amber-500/5 p-5 backdrop-blur-xl"
                    >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs font-black uppercase tracking-[0.28em] text-amber-400">
                                Pending Crew Approval
                            </div>
                            <p className="mt-1 text-sm text-white/55">
                                You&apos;re in the system, {currentUserMember.name}. An admin will approve your slot shortly — then
                                you&apos;ll appear on the public roster.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex-shrink-0 rounded-xl border border-amber-400/20 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-400 transition-all hover:bg-amber-400/10"
                        >
                            Edit Profile
                        </button>
                    </motion.div>
                )}

                {/* Error Banners */}
                {(fetchError || authError) && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex flex-col gap-3 rounded-[1.75rem] border border-red-500/20 bg-red-500/5 p-5 backdrop-blur-xl"
                    >
                        {fetchError && (
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                                    <WifiOff size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                        Database Error
                                    </div>
                                    <p className="mt-0.5 text-xs text-white/55">{fetchError}</p>
                                </div>
                            </div>
                        )}
                        {authError && (
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                                    <Terminal size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                        Auth Error
                                    </div>
                                    <p className="mt-0.5 text-xs text-white/55">{authError}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Member Grid */}
                <div className="mt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-2 border-white/5 rounded-2xl animate-spin" />
                                <div
                                    className="absolute inset-2 border-2 border-emerald-500/30 rounded-xl animate-spin"
                                    style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                                />
                                <Activity size={20} className="absolute inset-0 m-auto text-emerald-500" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.4em] text-white/20 uppercase animate-pulse">
                                Loading crew list...
                            </span>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="p-5 rounded-full bg-white/5">
                                <WifiOff size={40} className="text-white/20" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white/60 uppercase tracking-widest">No Pilots Found</p>
                                <p className="text-xs text-white/20 uppercase tracking-[0.2em] mt-1">Try a broader search</p>
                            </div>
                        </div>
                    ) : viewMode === "network" ? (
                        <RanksRolesChart />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredMembers.map((member) => (
                                    <MemberCard key={member.id} member={member} onClick={setSelectedMember} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer Area */}
                {!loading && filteredMembers.length > 0 && (
                    <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8 text-xs font-black uppercase tracking-[0.22em] text-white/25">
                        <span>{filteredMembers.length} Crew Members</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" />
                                <span>{filteredMembers.filter((m) => m.status === "active").length} Active</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recruitment CTA */}
                <div className="mt-12 mb-24">
                    <JoinCommunityCTA joinCTA={joinCTA} />
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedMember && <ProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdded={fetchMembers} />}
            </AnimatePresence>
            <AnimatePresence>
                {showEditModal && currentUserMember && (
                    <EditProfileModal
                        member={currentUserMember}
                        onClose={() => setShowEditModal(false)}
                        onUpdated={(updatedMember) => {
                            setCurrentUserMember(updatedMember);
                            fetchMembers();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
