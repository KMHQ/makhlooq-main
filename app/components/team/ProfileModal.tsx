"use client";

import { createElement, useState } from "react";
import { motion } from "motion/react";
import { X, Shield } from "lucide-react";
import type { TeamMember } from "@/payload-types";
import {
    AWARD_CATEGORIES,
    AWARD_TIERS,
    SEC_LEVELS,
    STATUS_META,
    formatDate,
    getAwardImage,
    getFlairIcon,
    getRoleConfig,
    parseAwards,
} from "./teamConfig";

interface ProfileModalProps {
    member: Partial<TeamMember> | null;
    isAdmin?: boolean;
    onMemberUpdated?: () => void;
    onClose: () => void;
}

export default function ProfileModal({ member, isAdmin = false, onMemberUpdated, onClose }: ProfileModalProps) {
    const [currentStatus, setCurrentStatus] = useState(member?.status || "inactive");
    const [currentIsAdmin, setCurrentIsAdmin] = useState(Boolean(member?.is_admin));
    const [updating, setUpdating] = useState(false);

    if (!member) return null;

    const { accent: fallbackAccent } = getRoleConfig(member.role);
    const accent = member.flair_color || fallbackAccent || "#10b981";
    const frameColor = member.node_color || accent;
    const initial = member.name?.[0]?.toUpperCase() || "?";
    const awards = parseAwards(member.awards);
    const status = STATUS_META[currentStatus] || STATUS_META.inactive;

    const updateMember = async (changes: Partial<TeamMember>) => {
        setUpdating(true);
        await fetch(`/api/team-members/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
        });
        setUpdating(false);
        onMemberUpdated?.();
    };

    const handleToggleStatus = () => {
        const next = currentStatus === "active" ? "inactive" : "active";
        setCurrentStatus(next);
        return updateMember({ status: next });
    };

    const handleToggleAdmin = () => {
        const next = !currentIsAdmin;
        setCurrentIsAdmin(next);
        return updateMember({ is_admin: next });
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: "rgba(1, 8, 3, 0.9)" }}
        >
            <motion.div
                className="relative w-full max-w-2xl"
                style={{
                    background: "linear-gradient(160deg, #020f05 0%, #010c04 100%)",
                    border: `1px solid ${frameColor}40`,
                    borderRadius: "4px",
                    fontFamily: "'Rajdhani', sans-serif",
                    boxShadow: `0 0 60px ${frameColor}10`,
                }}
                initial={{ scale: 0.92, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 24, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HUD Header */}
                <div
                    className="flex h-11 items-center justify-between rounded-t-[4px] border-b px-6"
                    style={{ borderColor: `${frameColor}25`, background: `${frameColor}08` }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 animate-pulse rounded-sm" style={{ background: frameColor }} />
                        <span className="font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: frameColor }}>
                            CITIZEN_DOSSIER // ACCESS_GRANTED
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-1.5 transition-colors hover:opacity-80"
                        style={{ color: frameColor }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scanlines */}
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[4px] opacity-30"
                    style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,#00000018 3px,#00000018 4px)" }}
                />

                {/* Corner brackets */}
                {[
                    "top-3 left-3 border-t border-l",
                    "top-3 right-3 border-t border-r",
                    "bottom-3 left-3 border-b border-l",
                    "bottom-3 right-3 border-b border-r",
                ].map((c, i) => (
                    <div key={i} className={`absolute h-5 w-5 ${c} pointer-events-none`} style={{ borderColor: `${frameColor}50` }} />
                ))}

                <div className="relative px-8 pb-8 pt-7">
                    {/* Top section */}
                    <div className="mb-8 flex gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div
                                className="flex h-32 w-32 items-center justify-center overflow-hidden text-5xl font-bold"
                                style={{
                                    background: `${frameColor}10`,
                                    border: `2px solid ${frameColor}60`,
                                    clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
                                    color: frameColor,
                                }}
                            >
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="animate-[text-glitch_1.5s_steps(1)_infinite]">{initial}</span>
                                )}
                            </div>
                            {/* Status pill */}
                            <div
                                className="mt-2.5 flex items-center justify-center gap-1.5 border py-1.5 font-mono text-[10px] uppercase tracking-widest"
                                style={{ borderColor: `${frameColor}25`, background: `${frameColor}08`, color: frameColor }}
                            >
                                <div className={`h-2 w-2 rounded-full ${status.dot}`} />
                                {status.label}
                            </div>
                        </div>

                        {/* Name block */}
                        <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <h2 className="truncate text-3xl font-bold leading-none tracking-tight text-white">
                                    {member.name || "UNKNOWN_SUBJECT"}
                                </h2>
                                {currentIsAdmin && (
                                    <span className="flex flex-shrink-0 items-center gap-1 rounded border border-purple-500/40 bg-purple-500/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                        <Shield size={11} className="text-purple-400" /> ADMIN
                                    </span>
                                )}
                            </div>
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
                                                className="inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
                                                style={{
                                                    color: currentAccent,
                                                    background: `${currentAccent}12`,
                                                    borderColor: `${currentAccent}30`,
                                                }}
                                            >
                                                {createElement(showIcon, { size: 11 })}
                                                {flair}
                                            </span>
                                        );
                                    })}
                            </div>
                            {/* Meta fields */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                                {[
                                    { label: "RANK", val: member.category || "Makhlooq" },
                                    { label: "DEPLOYED", val: formatDate(member.joined_at) },
                                    {
                                        label: "CLEARANCE",
                                        val: member.sec_level && SEC_LEVELS.includes(member.sec_level) ? member.sec_level : "R0",
                                    },
                                    { label: "UID", val: member.discord_uid || "0x??????" },
                                ].map((f) => (
                                    <div key={f.label} className="border-l-2 pl-3.5" style={{ borderColor: `${frameColor}30` }}>
                                        <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#2a5c35]">
                                            {f.label}
                                        </div>
                                        <div className="truncate font-mono text-[12px] uppercase tracking-wide text-white">{f.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="mb-5 border-t pb-3 pt-5" style={{ borderColor: `${frameColor}20` }}>
                            <div className="mb-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-emerald-400" />
                                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                                        ADMIN_OVERRIDE_CONTROLS //
                                    </span>
                                </div>
                                {updating && <span className="animate-pulse font-mono text-[10px] uppercase text-lime-400">SAVING…</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Active / Inactive Status Toggle Button */}
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={updating}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm font-bold transition-all ${
                                        currentStatus === "active"
                                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:bg-emerald-500/25"
                                            : "border-gray-600/30 bg-gray-800/40 text-gray-400 hover:bg-gray-800/60"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span
                                            className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${currentStatus === "active" ? "animate-pulse bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-gray-500"}`}
                                        />
                                        {currentStatus === "active" ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                    <span className="ml-1 text-[10px] uppercase tracking-widest opacity-60">TOGGLE</span>
                                </button>

                                {/* Admin Power Toggle Button */}
                                <button
                                    type="button"
                                    onClick={handleToggleAdmin}
                                    disabled={updating}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm font-bold transition-all ${
                                        currentIsAdmin
                                            ? "border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:bg-purple-500/25"
                                            : "border-gray-600/30 bg-gray-800/40 text-gray-400 hover:bg-gray-800/60"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <Shield
                                            size={14}
                                            className={currentIsAdmin ? "flex-shrink-0 text-purple-400" : "flex-shrink-0 text-gray-500"}
                                        />
                                        {currentIsAdmin ? "ADMIN: ON" : "ADMIN: OFF"}
                                    </span>
                                    <span className="ml-1 text-[10px] uppercase tracking-widest opacity-60">TOGGLE</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Awards */}
                    {awards.length > 0 && (
                        <div className="border-t pb-3 pt-5" style={{ borderColor: `${frameColor}15` }}>
                            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#2a5c35]">SERVICE_AWARDS //</div>
                            <div className="flex flex-wrap gap-4">
                                {awards.map((award, i) => {
                                    const imgUrl = getAwardImage(award.category, award.tier);
                                    const details = AWARD_CATEGORIES[award.category];
                                    const title = `${award.category} - ${award.tier}`;
                                    return (
                                        <div
                                            key={i}
                                            className="group/award relative flex flex-shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 transition-all hover:border-emerald-500/40 hover:bg-white/[0.06]"
                                        >
                                            {imgUrl && <img src={imgUrl} alt={title} className="h-10 w-10 flex-shrink-0 object-contain" />}
                                            <div className="flex min-w-0 flex-col pr-1.5">
                                                <span className="whitespace-nowrap font-mono text-sm font-bold leading-tight text-white">
                                                    {award.category}
                                                </span>
                                                <span className="mt-0.5 whitespace-nowrap font-mono text-xs font-medium uppercase tracking-wider text-emerald-400">
                                                    {award.tier}
                                                </span>
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className="pointer-events-none absolute bottom-full left-0 z-[100] mb-2 hidden w-72 rounded-xl border border-emerald-500/40 bg-[#020d05] p-4 text-left shadow-2xl group-hover/award:block md:w-80">
                                                <div className="text-xs font-bold uppercase tracking-wider text-white">
                                                    {award.category} ({award.tier})
                                                </div>
                                                {details && (
                                                    <div className="mt-1.5 font-sans text-xs font-normal leading-relaxed text-gray-200">
                                                        {details.desc}
                                                    </div>
                                                )}
                                                {details && AWARD_TIERS[award.tier] && (
                                                    <div className="mt-2 border-t border-white/10 pt-1.5 font-mono text-[10px] font-bold text-emerald-400">
                                                        Requirement: {AWARD_TIERS[award.tier].merits}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Bio */}
                    <div className="border-t pt-5" style={{ borderColor: `${frameColor}15` }}>
                        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#2a5c35]">SUBJECT_BIO //</div>
                        <p className="font-mono text-xs leading-relaxed md:text-sm" style={{ color: `${frameColor}90` }}>
                            {member.bio || "NO BIO DATA FOUND"}
                        </p>
                    </div>
                </div>

                {/* Footer shimmer */}
                <div className="h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${frameColor}40, transparent)` }} />
            </motion.div>
        </motion.div>
    );
}
