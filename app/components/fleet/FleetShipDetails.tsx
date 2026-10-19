"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { FleetShip } from "./ships";

interface FleetShipDetailsProps {
    ship: FleetShip | null;
    onOpenMemberModal?: (target: string | null, owner: string) => void;
}

export default function FleetShipDetails({ ship, onOpenMemberModal }: FleetShipDetailsProps) {
    // Avatar fetched for a ship without one, tagged with the ship and CO it was fetched for
    const avatarTarget = ship?.ceoDiscordUid || ship?.ceoName || "";
    const avatarKey = `${ship?.id}|${avatarTarget}`;
    const [fetchedAvatar, setFetchedAvatar] = useState<{ key: string; url: string } | null>(null);
    // Set when the image fails to load; cleared implicitly once the ship or CO changes
    const [failedAvatarKey, setFailedAvatarKey] = useState<string | null>(null);
    const avatarUrl =
        failedAvatarKey === avatarKey ? "" : ship?.ceoAvatarUrl || (fetchedAvatar?.key === avatarKey ? fetchedAvatar.url : "");

    useEffect(() => {
        if (!ship?.ceoAvatarUrl && avatarTarget) {
            fetch(`/api/team-members?discord_uid=${encodeURIComponent(avatarTarget)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.avatar_url) {
                        setFetchedAvatar({ key: avatarKey, url: data.avatar_url });
                    }
                })
                .catch(() => {});
        }
    }, [avatarKey, avatarTarget, ship?.ceoAvatarUrl]);

    if (!ship)
        return (
            <div className="w-full h-full rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl flex items-center justify-center">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">Select a ship to see details</div>
            </div>
        );

    const stats = [
        { label: "Length", val: ship.length || "N/A" },
        { label: "Crew", val: ship.crew || "N/A" },
        { label: "Cargo", val: ship.cargo || "N/A" },
        { label: "Speed", val: ship.topSpeed || "N/A" },
    ];

    const owner = ship.ceoName && ship.ceoName.trim() !== "" ? ship.ceoName.trim() : null;
    const profileTarget = ship.ceoDiscordUid ? ship.ceoDiscordUid : owner;

    return (
        <AnimatePresence mode="wait">
            <motion.aside
                key={ship.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full h-full rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] overflow-hidden flex gap-0"
            >
                {/* Subtle top-edge glow */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />

                {/* LEFT: Identity */}
                <div className="flex flex-col justify-center px-5 py-3 flex-1 min-w-0 border-r border-white/[0.06]">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-lime-400/70 leading-none mt-0 mb-0.5">
                        {ship.manufacturer}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-mono font-black uppercase tracking-tight text-white leading-tight truncate mt-0 mb-0">
                        {ship.name}
                    </h2>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 leading-none mb-0">
                        {ship.role || ship.class}
                    </div>

                    {/* Owner badge */}
                    {owner ? (
                        <button
                            type="button"
                            onClick={() => onOpenMemberModal?.(profileTarget, owner)}
                            title={`View ${owner}'s Profile`}
                            className="inline-flex items-center gap-2.5 self-start rounded-full border border-lime-400/30 bg-lime-400/5 pr-4 pl-1.5 py-1.5 hover:border-lime-400/70 hover:bg-lime-400/15 hover:shadow-[0_0_15px_rgba(163,230,53,0.25)] transition-all cursor-pointer group/co"
                        >
                            {/* Avatar Box */}
                            <div className="relative flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-lime-400/10 border border-lime-400/30 overflow-hidden group-hover/co:border-lime-400/80 transition-colors">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={owner}
                                        className="w-full h-full object-cover"
                                        onError={() => setFailedAvatarKey(avatarKey)}
                                    />
                                ) : (
                                    <svg
                                        className="w-4 h-4 text-lime-400/70 group-hover/co:text-lime-300 group-hover/co:scale-110 transition-transform"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="flex flex-col items-start leading-none justify-center">
                                <span className="text-[7px] font-mono font-bold text-lime-400/80 uppercase tracking-[0.2em] mb-1">
                                    Commanding Officer
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-lime-300 group-hover/co:text-white transition-colors truncate max-w-[130px]">
                                        {owner}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-lime-400/50 group-hover/co:text-lime-400 group-hover/co:translate-x-0.5 transition-all">
                                        →
                                    </span>
                                </div>
                            </div>
                        </button>
                    ) : null}

                    {/* Description */}
                    <div className="mt-2.5 overflow-y-auto pr-3 flex-1 min-h-[3rem] max-h-[5.5rem] md:max-h-[7rem] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <p className="text-sm md:text-base leading-relaxed text-white/80 pb-2">{ship.description}</p>
                    </div>
                </div>

                {/* RIGHT: Stats grid */}
                <div className="grid grid-cols-2 shrink-0 w-[220px]">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`flex flex-col justify-center px-4 py-3
                ${i % 2 === 0 ? "border-r border-white/[0.06]" : ""}
                ${i < 2 ? "border-b border-white/[0.06]" : ""}
              `}
                        >
                            <div className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-lime-400/70 mb-1">{s.label}</div>
                            <div className="text-sm font-sans font-black text-white truncate leading-normal py-0.5">{s.val}</div>
                        </div>
                    ))}
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
