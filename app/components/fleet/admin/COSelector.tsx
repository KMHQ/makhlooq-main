"use client";

import { useState, useRef, useEffect, type FormEvent, type MouseEvent } from "react";
import { Search, User, Check, X, ChevronDown, Shield } from "lucide-react";
import type { TeamMember } from "@/types/db";

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
                className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all backdrop-blur-md ${
                    isOpen
                        ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : valueName
                          ? "border-emerald-500/30 bg-white/[0.03] hover:border-emerald-500/50"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {selectedMember ? (
                        <>
                            {selectedMember.avatar_url ? (
                                <img
                                    src={selectedMember.avatar_url}
                                    alt={selectedMember.name}
                                    className="w-6 h-6 rounded-full object-cover border border-emerald-400/40 shrink-0"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                    {selectedMember.name?.[0]?.toUpperCase() || "C"}
                                </div>
                            )}
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                                <span className="text-white font-bold text-xs truncate">{selectedMember.name}</span>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                    {selectedMember.category || "CO"}
                                </span>
                            </div>
                        </>
                    ) : valueName ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-gray-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                {valueName[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="min-w-0 flex-1 flex items-center gap-2">
                                <span className="text-white font-bold text-xs truncate">{valueName}</span>
                                <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                                    Custom
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <User size={14} className="text-gray-500" />
                            <span>{placeholder}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {valueName && (
                        <div
                            onClick={handleClear}
                            className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/10 transition-colors"
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
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-emerald-500/30 bg-[#050B08]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[320px]">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-white/10 bg-black/40 sticky top-0 z-10 space-y-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Discord member or rank..."
                                className="w-full rounded-xl border border-emerald-500/20 bg-white/[0.04] pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500/60 focus:bg-emerald-500/[0.06] transition-all"
                            />
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {teamMembers.length > 0 && (
                            <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-500/60 flex items-center gap-1">
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
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                        isSelected
                                            ? "bg-emerald-500/20 border border-emerald-500/40 text-white"
                                            : "hover:bg-white/[0.05] border border-transparent text-gray-300 hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {m.avatar_url ? (
                                            <img
                                                src={m.avatar_url}
                                                alt={m.name}
                                                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                                                {m.name?.[0]?.toUpperCase() || "C"}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex flex-col">
                                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                                {m.name}
                                                {m.discord_tag && (
                                                    <span className="text-[10px] font-mono text-gray-500 font-normal">
                                                        @{m.discord_tag}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wider truncate">
                                                {m.category || m.role || "Member"}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
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
                    <div className="p-3 border-t border-white/10 bg-black/60 shrink-0">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1.5">
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
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shrink-0"
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
