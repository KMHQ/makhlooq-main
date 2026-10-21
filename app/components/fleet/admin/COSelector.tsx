"use client";

import { useState, useRef, useEffect, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import { isUnoptimized } from "@/app/lib/media";
import { Search, User, Check, X, ChevronDown, Shield } from "lucide-react";
import type { TeamMember } from "@/payload-types";

interface CoChange {
    ceo_name: string;
    ceo_discord_uid: string;
}

interface COSelectorProps {
    valueName?: string;
    valueDiscordUid?: string;
    onChange: (value: CoChange) => void;
    teamMembers?: TeamMember[];
    placeholder?: string;
}

export default function COSelector({
    valueName = "",
    valueDiscordUid = "",
    onChange,
    teamMembers = [],
    placeholder = "Select or type CO...",
}: COSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [customName, setCustomName] = useState(valueName);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync internal customName during render when valueName changes externally
    const [prevValueName, setPrevValueName] = useState(valueName);
    if (prevValueName !== valueName) {
        setPrevValueName(valueName);
        setCustomName(valueName);
    }

    // Click outside listener
    useEffect(() => {
        function handleClickOutside(event: globalThis.MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter members based on search
    const filteredMembers = teamMembers.filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            m.name?.toLowerCase().includes(q) ||
            m.discord_tag?.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q) ||
            m.role?.toLowerCase().includes(q) ||
            m.discord_uid?.toLowerCase().includes(q)
        );
    });

    const selectedMember = teamMembers.find(
        (m) =>
            (valueDiscordUid && (m.discord_uid === valueDiscordUid || String(m.id) === valueDiscordUid)) ||
            (valueName && m.name?.toLowerCase() === valueName.toLowerCase()),
    );

    const handleSelectMember = (m: TeamMember) => {
        onChange({
            ceo_name: m.name,
            ceo_discord_uid: m.discord_uid || String(m.id),
        });
        setCustomName(m.name);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleCustomSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        onChange({
            ceo_name: customName.trim(),
            ceo_discord_uid: "",
        });
        setIsOpen(false);
    };

    const handleClear = (e: MouseEvent) => {
        e.stopPropagation();
        onChange({
            ceo_name: "",
            ceo_discord_uid: "",
        });
        setCustomName("");
        setSearchQuery("");
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left backdrop-blur-md transition-all ${
                    isOpen
                        ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : valueName
                          ? "border-emerald-500/30 bg-white/[0.03] hover:border-emerald-500/50"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {selectedMember ? (
                        <>
                            {selectedMember.avatar_url ? (
                                <Image
                                    src={selectedMember.avatar_url}
                                    alt={selectedMember.name}
                                    width={24}
                                    height={24}
                                    unoptimized={isUnoptimized(selectedMember.avatar_url)}
                                    className="h-6 w-6 shrink-0 rounded-full border border-emerald-400/40 object-cover"
                                />
                            ) : (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-[10px] font-black text-emerald-400">
                                    {selectedMember.name?.[0]?.toUpperCase() || "C"}
                                </div>
                            )}
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-xs font-bold text-white">{selectedMember.name}</span>
                                <span className="shrink-0 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">
                                    {selectedMember.category || "CO"}
                                </span>
                            </div>
                        </>
                    ) : valueName ? (
                        <>
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-black text-gray-300">
                                {valueName[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-xs font-bold text-white">{valueName}</span>
                                <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-gray-400">
                                    Custom
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User size={14} className="text-gray-500" />
                            <span>{placeholder}</span>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {valueName && (
                        <div
                            onClick={handleClear}
                            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-red-400"
                            title="Clear CO"
                        >
                            <X size={12} />
                        </div>
                    )}
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-400" : ""}`}
                    />
                </div>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-[320px] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#050B08]/95 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                    {/* Search Bar */}
                    <div className="sticky top-0 z-10 space-y-2 border-b border-white/10 bg-black/40 p-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Discord member or rank..."
                                className="w-full rounded-xl border border-emerald-500/20 bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white outline-none transition-all focus:border-emerald-500/60 focus:bg-emerald-500/[0.06]"
                            />
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
                        {teamMembers.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-500/60">
                                <Shield size={10} /> Synced Discord Roster ({filteredMembers.length})
                            </div>
                        )}

                        {filteredMembers.map((m) => {
                            const isSelected =
                                (valueDiscordUid && (m.discord_uid === valueDiscordUid || String(m.id) === valueDiscordUid)) ||
                                (valueName && m.name?.toLowerCase() === valueName.toLowerCase());

                            return (
                                <button
                                    key={m.id || m.discord_uid}
                                    type="button"
                                    onClick={() => handleSelectMember(m)}
                                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                        isSelected
                                            ? "border border-emerald-500/40 bg-emerald-500/20 text-white"
                                            : "border border-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
                                    }`}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        {m.avatar_url ? (
                                            <Image
                                                src={m.avatar_url}
                                                alt={m.name}
                                                width={32}
                                                height={32}
                                                unoptimized={isUnoptimized(m.avatar_url)}
                                                className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-black text-emerald-400">
                                                {m.name?.[0]?.toUpperCase() || "C"}
                                            </div>
                                        )}
                                        <div className="flex min-w-0 flex-col">
                                            <div className="flex items-center gap-1.5 truncate text-xs font-bold text-white">
                                                {m.name}
                                                {m.discord_tag && (
                                                    <span className="font-mono text-[10px] font-normal text-gray-500">
                                                        @{m.discord_tag}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="truncate font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                                                {m.category || m.role || "Member"}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && <Check size={14} className="shrink-0 text-emerald-400" />}
                                </button>
                            );
                        })}

                        {teamMembers.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-500">
                                No synced Discord members loaded. Use custom name below.
                            </div>
                        )}
                    </div>

                    {/* Custom Name Section */}
                    <div className="shrink-0 border-t border-white/10 bg-black/60 p-3">
                        <div className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            Or Enter Custom CO Name
                        </div>
                        <form onSubmit={handleCustomSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="Type unlisted CO name..."
                                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500/50"
                            />
                            <button
                                type="submit"
                                className="shrink-0 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-emerald-400"
                            >
                                Set
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
