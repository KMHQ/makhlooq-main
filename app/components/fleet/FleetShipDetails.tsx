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
            <div className="flex h-full w-full items-center justify-center rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">Select a ship to see details</div>
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
                className="relative flex h-full w-full gap-0 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl"
            >
                {/* Subtle top-edge glow */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />

                {/* LEFT: Identity */}
                <div className="flex min-w-0 flex-1 flex-col justify-center border-r border-white/[0.06] px-5 py-3">
                    <div className="mb-0.5 mt-0 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.25em] text-lime-400/70">
                        {ship.manufacturer}
                    </div>
                    <h2 className="mb-0 mt-0 truncate font-mono text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl">
                        {ship.name}
                    </h2>
                    <div className="mb-0 font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-white/40">
                        {ship.role || ship.class}
                    </div>

                    {/* Owner badge */}
                    {owner ? (
                        <button
                            type="button"
                            onClick={() => onOpenMemberModal?.(profileTarget, owner)}
                            title={`View ${owner}'s Profile`}
                            className="group/co inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border border-lime-400/30 bg-lime-400/5 py-1.5 pl-1.5 pr-4 transition-all hover:border-lime-400/70 hover:bg-lime-400/15 hover:shadow-[0_0_15px_rgba(163,230,53,0.25)]"
                        >
                            {/* Avatar Box */}
                            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-lime-400/30 bg-lime-400/10 transition-colors group-hover/co:border-lime-400/80">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={owner}
                                        className="h-full w-full object-cover"
                                        onError={() => setFailedAvatarKey(avatarKey)}
                                    />
                                ) : (
                                    <svg
                                        className="h-4 w-4 text-lime-400/70 transition-transform group-hover/co:scale-110 group-hover/co:text-lime-300"
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
                            <div className="flex flex-col items-start justify-center leading-none">
                                <span className="mb-1 font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-lime-400/80">
                                    Commanding Officer
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="max-w-[130px] truncate font-mono text-[10px] font-black uppercase tracking-widest text-lime-300 transition-colors group-hover/co:text-white">
                                        {owner}
                                    </span>
                                    <span className="font-mono text-[10px] font-bold text-lime-400/50 transition-all group-hover/co:translate-x-0.5 group-hover/co:text-lime-400">
                                        →
                                    </span>
                                </div>
                            </div>
                        </button>
                    ) : null}

                    {/* Description */}
                    <div className="mt-2.5 max-h-[5.5rem] min-h-[3rem] flex-1 overflow-y-auto pr-3 md:max-h-[7rem] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
                        <p className="pb-2 text-sm leading-relaxed text-white/80 md:text-base">{ship.description}</p>
                    </div>
                </div>

                {/* RIGHT: Stats grid */}
                <div className="grid w-[220px] shrink-0 grid-cols-2">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`flex flex-col justify-center px-4 py-3 ${i % 2 === 0 ? "border-r border-white/[0.06]" : ""} ${i < 2 ? "border-b border-white/[0.06]" : ""} `}
                        >
                            <div className="mb-1 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-lime-400/70">{s.label}</div>
                            <div className="truncate py-0.5 font-sans text-sm font-black leading-normal text-white">{s.val}</div>
                        </div>
                    ))}
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
