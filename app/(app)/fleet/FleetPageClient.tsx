"use client";

import { useState, useEffect, useCallback, useRef, type UIEvent, type WheelEvent } from "react";
import Image from "next/image";
import { AnimatePresence } from "motion/react";
import { useLivePreview } from "@payloadcms/live-preview-react";
import { getServerUrl } from "@/app/lib/serverUrl";
import { isUnoptimized } from "@/app/lib/media";
import type { PageData } from "@/app/lib/payload/queries";
import type { FleetYardsModel, FleetYardsVehicle } from "@/types/fleetyards";
import type { TeamMember } from "@/payload-types";
import Header from "@/app/components/Header";
import FleetScene from "@/app/components/fleet/FleetScene";
import FleetShipDetails from "@/app/components/fleet/FleetShipDetails";
import ProfileModal from "@/app/components/team/ProfileModal";
import {
    formatCurrency,
    formatNumber,
    getShipPrice,
    mapVehicleToShip,
    type FleetConfigEntry,
    type FleetShip,
} from "@/app/components/fleet/ships";

const CAPITAL_TYPES = ["sub_capital", "capital"];
const CARDS_PER_SLIDE = 4;

function toFleetShip(item: FleetYardsVehicle, id: string, cfg: FleetConfigEntry, name: string): FleetShip {
    return {
        ...mapVehicleToShip(item),
        id,
        name,
        sourceFleet: name,
        fleetSlug: cfg.slug,
        fleetType: cfg.fleet_type || "small",
        ceoName: cfg.ceo_name || "",
        ceoDiscordUid: cfg.ceo_discord_uid || "",
        ceoAvatarUrl: cfg.ceo_avatar_url || "",
        fleetQuantity: cfg.quantity || 1,
    };
}

// Each config is either a single FleetYards ship model or a whole FleetYards fleet.
async function loadConfigShips(cfg: FleetConfigEntry, cfgIndex: number): Promise<FleetShip[]> {
    const modelRes = await fetch(`/api/fleetyards/models?slugs=${encodeURIComponent(cfg.slug)}&fresh=1`, { cache: "no-store" });
    const modelData = (await modelRes.json().catch(() => ({}))) as { items?: FleetYardsModel[] };
    const model = modelData.items?.find((item) => item && !item.error);

    if (modelRes.ok && model) {
        // Unique ID per config entry so same-slug ships aren't deduped
        const id = cfg.id ? `cfg-${cfg.id}` : `cfg-${cfgIndex}-${cfg.slug}`;
        return [toFleetShip(model, id, cfg, cfg.display_name || model.name || cfg.slug)];
    }

    const fleetRes = await fetch(`/api/fleetyards/vehicles?slug=${encodeURIComponent(cfg.slug)}&all=1&perPage=50`);
    const fleetData = (await fleetRes.json().catch(() => ({}))) as { items?: FleetYardsVehicle[]; error?: string };

    if (fleetRes.ok && !fleetData.error) {
        return (fleetData.items ?? []).map((item, itemIdx) => {
            const id = item.id ? `${item.id}-cfg${cfg.id || cfgIndex}` : `cfg-${cfgIndex}-item${itemIdx}`;
            return toFleetShip(item, id, cfg, cfg.display_name || cfg.slug);
        });
    }

    console.warn(`FleetYards slug "${cfg.slug}" failed as model and fleet`, {
        model: modelData.items?.[0]?.error,
        fleet: fleetData.error,
    });
    return [];
}

const fallbackOfficer = (name: string): Partial<TeamMember> => ({
    name,
    role: "Commanding Officer",
    category: "Makhlooq",
    status: "active",
    bio: "Commanding Officer assigned to this fleet asset.",
});

export default function FleetPageClient({ data: initialData }: { data: PageData<"fleet-page"> | null }) {
    const { data } = useLivePreview<PageData<"fleet-page">>({
        initialData: initialData ?? ({} as PageData<"fleet-page">),
        serverURL: getServerUrl(),
        depth: 2,
    });

    const kicker = data?.kicker || "KMHQ · Capital Assets";
    const headingLine1 = data?.headingLine1 || "Fleet";
    const headingLine2 = data?.headingLine2 || "Command";
    const badgeText = data?.badgeText || "Live";
    const shipsReadyLabel = data?.shipsReadyLabel || "Ships Ready";
    const totalValueLabel = data?.totalValueLabel || "Total Flex";
    const crewSeatsLabel = data?.crewSeatsLabel || "Crew Seats";
    const standardKicker = data?.standardKicker || "Admin Managed";
    const standardHeading = data?.standardHeading || "Standard Fleets";
    const searchPlaceholder = data?.searchPlaceholder || "Search fleets...";

    const [ships, setShips] = useState<FleetShip[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedShipDetails, setSelectedShipDetails] = useState<FleetShip | null>(null);
    const [loadingSelectedShip, setLoadingSelectedShip] = useState(false);
    const [loadingShips, setLoadingShips] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [capitalPage, setCapitalPage] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const [selectedMemberForModal, setSelectedMemberForModal] = useState<Partial<TeamMember> | null>(null);

    const handleOpenCoModal = async (target: string | null, fallbackName: string) => {
        const query = target || fallbackName;
        if (!query) return;
        try {
            const res = await fetch(`/api/team-members?discord_uid=${encodeURIComponent(query)}`);
            const member = (await res.json().catch(() => null)) as (TeamMember & { error?: string }) | null;
            setSelectedMemberForModal(res.ok && member?.id && !member.error ? member : fallbackOfficer(fallbackName || query));
        } catch {
            setSelectedMemberForModal(fallbackOfficer(fallbackName || query));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoadingShips(true);

            try {
                const configsRes = await fetch("/api/fleet-configs");
                const configsData = await configsRes.json();
                if (!configsRes.ok) throw new Error(configsData?.error || `Fleet config error (${configsRes.status})`);

                const configs: FleetConfigEntry[] = Array.isArray(configsData) ? configsData : [];
                const activeConfigs = configs.filter((cfg) => cfg.enabled !== false);
                const sourceConfigs = activeConfigs.length > 0 ? activeConfigs : configs;

                // Each config entry is intentionally its own ship card; no dedup.
                const fleetShips = (await Promise.all(sourceConfigs.map(loadConfigShips))).flat();
                if (!cancelled) setShips(fleetShips);
            } catch (error) {
                console.error("Failed to fetch public ship data from FleetYards:", error);
                if (!cancelled) setShips([]);
            } finally {
                if (!cancelled) setLoadingShips(false);
            }
        };

        fetchData();
        return () => {
            cancelled = true;
        };
    }, []);

    const goPrev = useCallback(() => {
        if (ships.length === 0) return;
        setSelectedIndex((i) => ((i < ships.length ? i : 0) - 1 + ships.length) % ships.length);
    }, [ships.length]);

    const goNext = useCallback(() => {
        if (ships.length === 0) return;
        setSelectedIndex((i) => ((i < ships.length ? i : 0) + 1) % ships.length);
    }, [ships.length]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [goNext, goPrev]);

    // Fall back to the first ship when the list shrinks below the selected index
    const selectedShip = ships[selectedIndex < ships.length ? selectedIndex : 0] || null;
    const activeShip = selectedShipDetails || selectedShip;

    // Refresh the selected ship's model details from FleetYards
    useEffect(() => {
        let cancelled = false;

        const fetchSelectedShip = async () => {
            setSelectedShipDetails(null);

            if (!selectedShip?.slug) {
                setLoadingSelectedShip(false);
                return;
            }

            setLoadingSelectedShip(true);

            try {
                const res = await fetch(`/api/fleetyards/models?slugs=${encodeURIComponent(selectedShip.slug)}&fresh=1`, {
                    cache: "no-store",
                });
                const modelData = (await res.json()) as { items?: FleetYardsModel[]; error?: string };
                if (!res.ok) throw new Error(modelData.error || `FleetYards model error (${res.status})`);

                const model = modelData.items?.find((item) => !item?.error);
                if (!model || cancelled) return;

                setSelectedShipDetails({ ...mapVehicleToShip(model), ...selectedShip, name: selectedShip.name || model.name || "" });
            } catch (error) {
                if (!cancelled) console.warn("Selected FleetYards model refresh failed:", error);
            } finally {
                if (!cancelled) setLoadingSelectedShip(false);
            }
        };

        fetchSelectedShip();
        return () => {
            cancelled = true;
        };
    }, [selectedShip]);

    const totalValue = ships.reduce((sum, ship) => sum + getShipPrice(ship), 0);
    const totalShips = ships.reduce((sum, ship) => sum + (ship.fleetQuantity || 1), 0);
    const totalMaxCrew = ships.reduce((sum, ship) => {
        const crewMax = Number(
            ship.crew
                .split("-")
                .pop()
                ?.replace(/[^0-9]/g, ""),
        );
        return sum + (Number.isFinite(crewMax) ? crewMax : 0) * (ship.fleetQuantity || 1);
    }, 0);

    // Each ship entry is its own card with count = its fleetQuantity
    const stackedShips = ships.map((ship, idx) => ({ ...ship, count: ship.fleetQuantity || 1, originalIndex: idx }));

    const filterBySearch = (shipList: typeof stackedShips) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return shipList;
        return shipList.filter((s) =>
            [s.name, s.manufacturer, s.ceoName, s.class, s.role, s.fleetSlug, s.slug].some((field) => field?.toLowerCase().includes(q)),
        );
    };

    const capitalFleets = filterBySearch(stackedShips.filter((s) => CAPITAL_TYPES.includes(s.fleetType)));
    const standardFleets = filterBySearch(stackedShips.filter((s) => !CAPITAL_TYPES.includes(s.fleetType)));

    const getCapitalTag = (idx: number) => `F${idx + 1}`;
    const getSfTag = (idx: number) => `SF${idx + 1}`;

    return (
        <div className="fleet-page relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#020402] text-white">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(101,163,13,0.18),transparent)]" />
                <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(163,230,53,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Header is position:fixed in CSS — it overlays automatically, no need to render in flow */}
            <Header siteSettings={data?.siteSettings} />

            {/* Main layout — fills entire screen, pt accounts for the fixed header (~64px) */}
            <div className="relative z-10 h-full w-full overflow-hidden px-4 pb-4 pt-[72px]">
                {loadingShips && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[2.5rem] bg-black/60 backdrop-blur-md">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime-400/30 border-t-lime-400" />
                            <div className="font-mono text-xs font-black uppercase tracking-[0.3em] text-lime-400/70">
                                Accessing Fleet Manifest...
                            </div>
                        </div>
                    </div>
                )}

                {/* Layout with 40% fleets column and 60% 3D column */}
                <div className="grid h-full w-full grid-cols-1 gap-3 lg:grid-cols-[4fr_6fr]">
                    {/* ═══════════════════════ LEFT COLUMN ═══════════════════════ */}
                    <div className="flex h-full flex-col gap-3 overflow-hidden">
                        {/* ── Panel A: Fleet Command ── */}
                        <div className="relative flex shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
                            {/* Gradient accent */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(132,204,22,0.12),transparent)]" />

                            <div className="relative p-5">
                                {/* Title */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-lime-400/50">
                                            {kicker}
                                        </div>
                                        <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-white xl:text-4xl">
                                            {headingLine1} <span className="text-lime-400">{headingLine2}</span>
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5">
                                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
                                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-lime-300">
                                            {badgeText}
                                        </span>
                                    </div>
                                </div>

                                {/* Capital Fleets — Horizontal Scroll-Snap Carousel */}
                                {(() => {
                                    const totalPages = Math.max(1, Math.ceil(capitalFleets.length / CARDS_PER_SLIDE));

                                    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
                                        const container = e.currentTarget;
                                        const page = Math.round(container.scrollLeft / container.clientWidth);
                                        setCapitalPage(page);
                                    };

                                    const scrollToPage = (pageIdx: number) => {
                                        const container = carouselRef.current;
                                        if (container) {
                                            container.scrollTo({
                                                left: pageIdx * container.clientWidth,
                                                behavior: "smooth",
                                            });
                                            setCapitalPage(pageIdx);
                                        }
                                    };

                                    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
                                        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                                            const now = Date.now();
                                            if (now - lastScrollTime.current > 400) {
                                                // 400ms cooldown for page flipping
                                                const direction = e.deltaY > 0 ? 1 : -1;
                                                const targetPage = Math.min(Math.max(0, capitalPage + direction), totalPages - 1);
                                                if (targetPage !== capitalPage) {
                                                    e.preventDefault();
                                                    scrollToPage(targetPage);
                                                    lastScrollTime.current = now;
                                                }
                                            } else {
                                                e.preventDefault();
                                            }
                                        }
                                    };

                                    return (
                                        <div>
                                            {/* Horizontal Scroll-Snap Container */}
                                            <div
                                                ref={carouselRef}
                                                onScroll={handleScroll}
                                                onWheel={handleWheel}
                                                className="scrollbar-none flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
                                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                            >
                                                {Array.from({ length: totalPages }).map((_, pageIdx) => {
                                                    const slideShips = capitalFleets.slice(
                                                        pageIdx * CARDS_PER_SLIDE,
                                                        (pageIdx + 1) * CARDS_PER_SLIDE,
                                                    );
                                                    const globalOffset = pageIdx * CARDS_PER_SLIDE;

                                                    return (
                                                        <div
                                                            key={pageIdx}
                                                            className="grid w-full shrink-0 snap-start snap-always grid-cols-2 gap-2.5"
                                                        >
                                                            {slideShips.map((ship, i) => {
                                                                const globalIdx = globalOffset + i;
                                                                return (
                                                                    <div key={ship.id} className="relative aspect-[16/8]">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedIndex(ship.originalIndex);
                                                                            }}
                                                                            className={`group absolute inset-0 h-full w-full rounded-xl transition-all duration-300 ${
                                                                                activeShip?.id === ship.id
                                                                                    ? "z-10 border-2 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                                                                                    : "z-0 border border-white/10 hover:border-lime-400/40"
                                                                            }`}
                                                                        >
                                                                            {/* Main Card */}
                                                                            <div className="absolute inset-0 overflow-hidden rounded-xl bg-black transition-all">
                                                                                {ship.thumbnail ? (
                                                                                    <Image
                                                                                        src={ship.thumbnail}
                                                                                        alt={ship.name}
                                                                                        fill
                                                                                        sizes="(min-width: 1024px) 20vw, 50vw"
                                                                                        unoptimized={isUnoptimized(ship.thumbnail)}
                                                                                        className="saturate-125 contrast-105 scale-100 object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/10 text-white/20">
                                                                                        <div className="h-12 w-12 rounded-full border border-white/10" />
                                                                                    </div>
                                                                                )}

                                                                                {/* Top Badge & Count */}
                                                                                <div className="absolute left-2 right-2 top-2 z-10 flex items-start justify-between">
                                                                                    <div className="rounded bg-lime-400 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-black">
                                                                                        {getCapitalTag(globalIdx)}
                                                                                    </div>
                                                                                    {ship.count > 1 && (
                                                                                        <div className="rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white backdrop-blur">
                                                                                            ×{ship.count}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Bottom Info */}
                                                                                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent p-2.5 text-left">
                                                                                    <div className="mb-0 truncate font-mono text-[9px] font-bold uppercase leading-none text-lime-400/70">
                                                                                        {ship.manufacturer}
                                                                                    </div>
                                                                                    <div className="mb-1.5 mt-0.5 truncate font-mono text-[13px] font-black uppercase leading-tight tracking-tight text-white">
                                                                                        {ship.name}
                                                                                    </div>
                                                                                    {ship.ceoName && (
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <span className="rounded border border-lime-400/30 bg-lime-400/15 px-1.5 py-0.5 font-mono text-[7px] font-black uppercase leading-none tracking-widest text-lime-400/90">
                                                                                                CO
                                                                                            </span>
                                                                                            <span className="truncate font-mono text-[9px] uppercase leading-none text-white/60">
                                                                                                {ship.ceoName}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Fill slide with empty blocks if it has fewer than 4 items */}
                                                            {slideShips.length < 4 &&
                                                                Array.from({ length: 4 - slideShips.length }).map((_, emptyIdx) => (
                                                                    <div
                                                                        key={`empty-${emptyIdx}`}
                                                                        className="relative aspect-[16/8] rounded-xl border border-dashed border-white/5 opacity-20"
                                                                    />
                                                                ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Carousel Pagination Controls */}
                                            {totalPages > 1 && (
                                                <div className="mt-2.5 flex items-center justify-between">
                                                    <button
                                                        onClick={() => scrollToPage(Math.max(0, capitalPage - 1))}
                                                        disabled={capitalPage === 0}
                                                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/50 transition-all hover:border-lime-400/40 hover:text-white disabled:opacity-30"
                                                    >
                                                        ‹ Prev
                                                    </button>
                                                    <div className="flex items-center gap-1.5">
                                                        {Array.from({ length: totalPages }).map((_, pi) => (
                                                            <button
                                                                key={pi}
                                                                onClick={() => scrollToPage(pi)}
                                                                className={`h-1.5 w-1.5 rounded-full transition-all ${
                                                                    pi === capitalPage ? "w-4 bg-lime-400" : "bg-white/20 hover:bg-white/40"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => scrollToPage(Math.min(totalPages - 1, capitalPage + 1))}
                                                        disabled={capitalPage === totalPages - 1}
                                                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/50 transition-all hover:border-lime-400/40 hover:text-white disabled:opacity-30"
                                                    >
                                                        Next ›
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Stats bar */}
                            <div className="grid grid-cols-3 border-t border-white/[0.07]">
                                {[
                                    { tag: "S", label: shipsReadyLabel, val: formatNumber(totalShips) },
                                    { tag: "T", label: totalValueLabel, val: formatCurrency(totalValue) },
                                    { tag: "C", label: crewSeatsLabel, val: formatNumber(totalMaxCrew) },
                                ].map((s, i) => (
                                    <div
                                        key={s.tag}
                                        className={`flex flex-col items-center justify-center px-2 py-3 ${i > 0 ? "border-l border-white/[0.07]" : ""}`}
                                    >
                                        <div className="mb-0.5 font-mono text-[8px] font-black uppercase tracking-[0.3em] text-lime-400/60">
                                            {s.label}
                                        </div>
                                        <div className="text-lg font-black leading-none text-white">{s.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Panel B: Standard Fleets ── */}
                        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl">
                            <div className="shrink-0 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <div className="mb-0.5 font-mono text-[9px] font-black uppercase tracking-[0.4em] text-lime-400/50">
                                            {standardKicker}
                                        </div>
                                        <div className="text-base font-black uppercase text-white">{standardHeading}</div>
                                    </div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                                        {standardFleets.length} vessels
                                    </div>
                                </div>
                                {/* Search */}
                                <div className="relative">
                                    <svg
                                        className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="w-full rounded-xl border border-white/[0.08] bg-black/30 py-2.5 pl-8 pr-4 font-mono text-[11px] text-white placeholder-white/25 outline-none transition-colors focus:border-lime-400/40"
                                    />
                                </div>
                            </div>

                            {/* Ships grid — scrollable */}
                            <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {standardFleets.map((ship, i) => {
                                        return (
                                            <div key={ship.id} className="relative aspect-[16/10]">
                                                <button
                                                    onClick={() => {
                                                        setSelectedIndex(ship.originalIndex);
                                                    }}
                                                    className={`group absolute inset-0 h-full w-full overflow-hidden rounded-xl transition-all duration-300 ${
                                                        activeShip?.id === ship.id
                                                            ? "border-2 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.25)]"
                                                            : "border border-white/[0.08] hover:border-lime-400/30"
                                                    }`}
                                                >
                                                    <div className="absolute inset-0 transition-all">
                                                        {ship.thumbnail ? (
                                                            <Image
                                                                src={ship.thumbnail}
                                                                alt={ship.name}
                                                                fill
                                                                sizes="(min-width: 1024px) 14vw, 33vw"
                                                                unoptimized={isUnoptimized(ship.thumbnail)}
                                                                className="saturate-125 contrast-105 object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 to-black/50" />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                                        <div className="absolute left-2 top-2 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white/70 backdrop-blur-sm">
                                                            {getSfTag(i)}
                                                        </div>

                                                        {ship.count > 1 && (
                                                            <div className="absolute right-2 top-2 rounded border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white backdrop-blur">
                                                                ×{ship.count}
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                                                            <div className="truncate py-0.5 font-mono text-[9px] uppercase leading-[1.4] text-lime-300/60">
                                                                {ship.manufacturer}
                                                            </div>
                                                            <div className="truncate py-0.5 font-mono text-xs font-black uppercase leading-[1.4] text-white">
                                                                {ship.name}
                                                            </div>
                                                            {ship.ceoName && (
                                                                <div className="mt-0.5 flex items-center gap-1.5">
                                                                    <span className="rounded border border-lime-400/30 bg-lime-400/15 px-1 py-0.5 font-mono text-[7px] font-black uppercase leading-none tracking-widest text-lime-400/90">
                                                                        CO
                                                                    </span>
                                                                    <span className="truncate font-mono text-[9px] uppercase leading-none text-white/60">
                                                                        {ship.ceoName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {standardFleets.length === 0 && !loadingShips && (
                                        <div className="col-span-2 flex aspect-[4/1] items-center justify-center rounded-xl border border-dashed border-white/10 font-mono text-[10px] uppercase tracking-widest text-white/25">
                                            {searchQuery ? "No matching fleets found" : "Admin has not added standard fleets"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════════════════ RIGHT COLUMN ═══════════════════════ */}
                    <div className="flex h-full flex-col gap-3 overflow-hidden">
                        {/* ── 3D Stage: Square viewer ── */}
                        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#010201] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                            {/* Ambient glow */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_80%,rgba(101,163,13,0.10),transparent)]" />

                            {/* Loading badge */}
                            {loadingSelectedShip && (
                                <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-lime-300/15 bg-black/70 px-3 py-1.5 backdrop-blur">
                                    <div className="h-2.5 w-2.5 animate-spin rounded-full border border-lime-400/60 border-t-lime-400" />
                                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-lime-100/55">Loading...</span>
                                </div>
                            )}

                            {/* HUD top-left */}
                            <div className="absolute left-5 top-5 z-20">
                                <div className="font-mono text-[9px] font-black uppercase tracking-[0.36em] text-lime-400/50">
                                    Ship Stage
                                </div>
                                <div className="mt-0.5 text-2xl font-black uppercase leading-none tracking-[-0.05em] text-white/90">
                                    {activeShip?.name || <span className="text-white/20">Select a Ship</span>}
                                </div>
                                {activeShip && (
                                    <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-lime-300/50">
                                        {activeShip.manufacturer} · {activeShip.class}
                                    </div>
                                )}
                            </div>

                            {/* 3D scene */}
                            <div className="absolute inset-0">
                                <FleetScene selectedShip={activeShip} />
                            </div>

                            {/* Nav hint */}
                            <div className="absolute bottom-4 right-5 z-20 hidden font-mono text-[9px] uppercase tracking-widest text-white/20 lg:block">
                                ← → to cycle ships
                            </div>
                        </div>

                        {/* ── Ship Details Panel ── */}
                        <div className="h-[190px] shrink-0">
                            <FleetShipDetails ship={activeShip} onOpenMemberModal={handleOpenCoModal} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Profile Modal Overlay */}
            <AnimatePresence>
                {selectedMemberForModal && <ProfileModal member={selectedMemberForModal} onClose={() => setSelectedMemberForModal(null)} />}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(163, 230, 53, 0.15);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(163, 230, 53, 0.35);
                }
            `}</style>
        </div>
    );
}
