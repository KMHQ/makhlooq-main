"use client";

import { createElement, useState } from "react";
import { motion } from "motion/react";
import { X, Shield } from "lucide-react";
import type { TeamMember } from "@/types/db";
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
                    className="flex items-center justify-between px-6 h-11 border-b rounded-t-[4px]"
                    style={{ borderColor: `${frameColor}25`, background: `${frameColor}08` }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-sm animate-pulse" style={{ background: frameColor }} />
                        <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: frameColor }}>
                            CITIZEN_DOSSIER // ACCESS_GRANTED
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="transition-colors p-1.5 cursor-pointer hover:opacity-80"
                        style={{ color: frameColor }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scanlines */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30 rounded-[4px] overflow-hidden"
                    style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,#00000018 3px,#00000018 4px)" }}
                />

                {/* Corner brackets */}
                {[
                    "top-3 left-3 border-t border-l",
                    "top-3 right-3 border-t border-r",
                    "bottom-3 left-3 border-b border-l",
                    "bottom-3 right-3 border-b border-r",
                ].map((c, i) => (
                    <div key={i} className={`absolute w-5 h-5 ${c} pointer-events-none`} style={{ borderColor: `${frameColor}50` }} />
                ))}

                <div className="relative px-8 pt-7 pb-8">
                    {/* Top section */}
                    <div className="flex gap-6 mb-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div
                                className="w-32 h-32 flex items-center justify-center text-5xl font-bold overflow-hidden"
                                style={{
                                    background: `${frameColor}10`,
                                    border: `2px solid ${frameColor}60`,
                                    clipPath: "polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))",
                                    color: frameColor,
                                }}
                            >
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="animate-[text-glitch_1.5s_steps(1)_infinite]">{initial}</span>
                                )}
                            </div>
                            {/* Status pill */}
                            <div
                                className="mt-2.5 flex items-center justify-center gap-1.5 py-1.5 border font-mono text-[10px] tracking-widest uppercase"
                                style={{ borderColor: `${frameColor}25`, background: `${frameColor}08`, color: frameColor }}
                            >
                                <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                                {status.label}
                            </div>
                        </div>

                        {/* Name block */}
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold text-white tracking-tight leading-none truncate">
                                    {member.name || "UNKNOWN_SUBJECT"}
                                </h2>
                                {currentIsAdmin && (
                                    <span className="flex-shrink-0 px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
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
                                                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded border"
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
                                        <div className="font-mono text-[9px] tracking-[0.2em] text-[#2a5c35] uppercase mb-0.5">
                                            {f.label}
                                        </div>
                                        <div className="font-mono text-[12px] text-white uppercase tracking-wide truncate">{f.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                        <div className="border-t pt-5 pb-3 mb-5" style={{ borderColor: `${frameColor}20` }}>
                            <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-emerald-400" />
                                    <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase font-black">
                                        ADMIN_OVERRIDE_CONTROLS //
                                    </span>
                                </div>
                                {updating && <span className="font-mono text-[10px] text-lime-400 animate-pulse uppercase">SAVING…</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Active / Inactive Status Toggle Button */}
                                <button
                                    type="button"
                                    onClick={handleToggleStatus}
                                    disabled={updating}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg border font-mono text-sm font-bold transition-all cursor-pointer ${
                                        currentStatus === "active"
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                            : "bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentStatus === "active" ? "bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-gray-500"}`}
                                        />
                                        {currentStatus === "active" ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-60 ml-1">TOGGLE</span>
                                </button>

                                {/* Admin Power Toggle Button */}
                                <button
                                    type="button"
                                    onClick={handleToggleAdmin}
                                    disabled={updating}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg border font-mono text-sm font-bold transition-all cursor-pointer ${
                                        currentIsAdmin
                                            ? "bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                                            : "bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <Shield
                                            size={14}
                                            className={currentIsAdmin ? "text-purple-400 flex-shrink-0" : "text-gray-500 flex-shrink-0"}
                                        />
                                        {currentIsAdmin ? "ADMIN: ON" : "ADMIN: OFF"}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-60 ml-1">TOGGLE</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Awards */}
                    {awards.length > 0 && (
                        <div className="border-t pt-5 pb-3" style={{ borderColor: `${frameColor}15` }}>
                            <div className="font-mono text-[10px] tracking-[0.2em] text-[#2a5c35] uppercase mb-4">SERVICE_AWARDS //</div>
                            <div className="flex flex-wrap gap-4">
                                {awards.map((award, i) => {
                                    const imgUrl = getAwardImage(award.category, award.tier);
                                    const details = AWARD_CATEGORIES[award.category];
                                    const title = `${award.category} - ${award.tier}`;
                                    return (
                                        <div
                                            key={i}
                                            className="group/award relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all flex-shrink-0"
                                        >
                                            {imgUrl && <img src={imgUrl} alt={title} className="w-10 h-10 object-contain flex-shrink-0" />}
                                            <div className="flex flex-col pr-1.5 min-w-0">
                                                <span className="font-mono text-sm text-white font-bold leading-tight whitespace-nowrap">
                                                    {award.category}
                                                </span>
                                                <span className="font-mono text-xs text-emerald-400 font-medium mt-0.5 tracking-wider uppercase whitespace-nowrap">
                                                    {award.tier}
                                                </span>
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full left-0 mb-2 w-72 md:w-80 hidden group-hover/award:block bg-[#020d05] border border-emerald-500/40 p-4 rounded-xl shadow-2xl text-left z-[100] pointer-events-none">
                                                <div className="font-bold text-xs text-white uppercase tracking-wider">
                                                    {award.category} ({award.tier})
                                                </div>
                                                {details && (
                                                    <div className="text-xs text-gray-200 mt-1.5 leading-relaxed font-sans font-normal">
                                                        {details.desc}
                                                    </div>
                                                )}
                                                {details && AWARD_TIERS[award.tier] && (
                                                    <div className="text-[10px] text-emerald-400 font-mono font-bold mt-2 pt-1.5 border-t border-white/10">
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
                        <div className="font-mono text-[10px] tracking-[0.2em] text-[#2a5c35] uppercase mb-2.5">SUBJECT_BIO //</div>
                        <p className="font-mono text-xs md:text-sm leading-relaxed" style={{ color: `${frameColor}90` }}>
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
