"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { getServerUrl } from "@/app/lib/serverUrl";
import { isUnoptimized, mediaUrl } from "@/app/lib/media";
import type { NewsPage, NewsPost, SiteSetting, TeamMember } from "@/payload-types";
import { motion, AnimatePresence } from "motion/react";
import Lenis from "lenis";
import Header from "@/app/components/Header";
import { PortableTextRenderer } from "@/app/components/PortableTextRenderer";

type ContentBlock = NonNullable<NewsPost["contentBlocks"]>[number];
import { Radio, Search, Calendar, User, Newspaper, Flame, ShieldAlert, Sparkles, Image as ImageIcon, Video } from "lucide-react";
import { useLivePreview } from "@payloadcms/live-preview-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a YouTube / Vimeo watch URL to an embeddable src */
function toEmbedSrc(url: string | null | undefined) {
    if (!url) return null;
    // YouTube: watch?v=ID or youtu.be/ID
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    // Treat as direct URL otherwise
    return url;
}

/** Is a URL or MIME type pointing to a raw video file? */
function isDirectVideoUrl(url: string) {
    return /\.(mp4|webm|ogg|mov)([\?#].*)?$/i.test(url);
}

// ─── Block Renderer ──────────────────────────────────────────────────────────

function ContentBlocks({ blocks, accentText }: { blocks: ContentBlock[]; accentText: string }) {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;

    return (
        <div className="w-full space-y-8">
            {blocks.map((block, idx) => {
                switch (block.blockType) {
                    case "textBlock":
                        return (
                            <div
                                key={idx}
                                className="relative rounded-2xl border border-white/[0.03] bg-white/[0.01] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]"
                            >
                                <div className="mb-3 flex select-none items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                    COMMS DATA // DECREE_{idx + 1}
                                </div>
                                <div className="prose prose-invert prose-emerald max-w-none text-sm leading-relaxed text-gray-300">
                                    <PortableTextRenderer content={block.content} />
                                </div>
                            </div>
                        );

                    case "imageBlock": {
                        const imgSrc = mediaUrl(block.image);
                        if (!imgSrc) return null;
                        const media = typeof block.image === "object" ? block.image : null;
                        return (
                            <figure
                                key={idx}
                                className={`group relative w-full rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02] ${block.fullWidth ? "" : "mx-auto max-w-3xl"}`}
                            >
                                <div className="mb-3 flex select-none items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                                    VISUAL SCAN // COMP_{idx + 1}
                                </div>
                                <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                    <Image
                                        src={imgSrc}
                                        alt={media?.alt || block.caption || ""}
                                        width={media?.width || 1600}
                                        height={media?.height || 900}
                                        sizes={block.fullWidth ? "100vw" : "(min-width: 768px) 768px, 100vw"}
                                        unoptimized={isUnoptimized(imgSrc)}
                                        className="h-auto max-h-[70vh] w-auto max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                                    />
                                </div>
                                {block.caption && (
                                    <figcaption className="mt-3 select-none text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    }

                    case "videoBlock": {
                        const isUrl = block.videoSource === "url";
                        const src = isUrl ? block.videoUrl : mediaUrl(block.videoFile);
                        if (!src) return null;

                        const isDirect = isUrl ? isDirectVideoUrl(src) : true;

                        return (
                            <figure
                                key={idx}
                                className="group relative mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]"
                            >
                                <div className="mb-3 flex select-none items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
                                    VIDEO TRANSMISSION // CAPTURE_{idx + 1}
                                </div>
                                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                                    {isDirect ? (
                                        <video
                                            src={src}
                                            controls
                                            autoPlay={block.autoplay ?? undefined}
                                            muted={block.autoplay ?? undefined}
                                            loop={block.autoplay ?? undefined}
                                            playsInline
                                            className="h-full w-full bg-black object-contain"
                                        />
                                    ) : (
                                        <iframe
                                            src={toEmbedSrc(src) ?? undefined}
                                            title={block.caption || "Video"}
                                            className="h-full w-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                                {block.caption && (
                                    <figcaption className="mt-3 select-none text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    }

                    case "embedBlock": {
                        if (!block.url) return null;
                        const embedSrc = toEmbedSrc(block.url);
                        const isDirect = isDirectVideoUrl(block.url);

                        return (
                            <figure
                                key={idx}
                                className="group relative mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02]"
                            >
                                <div className="mb-3 flex select-none items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-gray-500">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                                    EXTERNAL FEED // CONNECT_{idx + 1}
                                </div>
                                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                                    {isDirect ? (
                                        <video src={block.url} controls className="h-full w-full bg-black object-contain" />
                                    ) : (
                                        <iframe
                                            src={embedSrc ?? undefined}
                                            title={block.caption || "Embed"}
                                            className="h-full w-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                                {block.caption && (
                                    <figcaption className="mt-3 select-none text-center font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
                                        {block.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    }

                    default:
                        return null;
                }
            })}
        </div>
    );
}

// ─── Author Display ──────────────────────────────────────────────────────────

function resolveAuthor(post: NewsPost) {
    // Member relationship (populated at depth >= 1)
    if (post.authorSource === "member" && post.authorMember && typeof post.authorMember === "object") {
        const m: TeamMember = post.authorMember;
        return {
            name: m.name || m.discord_tag || "Team Member",
            avatar: m.avatar_url || null,
            handle: m.discord_tag || null,
        };
    }
    // New: external text
    if (post.authorExternal) {
        return { name: post.authorExternal, avatar: null, handle: null };
    }
    // Legacy
    if (post.authorHandle) {
        return { name: post.authorHandle, avatar: null, handle: post.authorHandle };
    }
    return null;
}

function AuthorBadge({ post, accentText, className = "" }: { post: NewsPost; accentText: string; className?: string }) {
    const author = resolveAuthor(post);
    if (!author) return null;

    return (
        <div className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gray-300 ${className}`}>
            {author.avatar ? (
                <Image
                    src={author.avatar}
                    alt={author.name}
                    width={20}
                    height={20}
                    unoptimized={isUnoptimized(author.avatar)}
                    className="h-5 w-5 rounded-full border border-white/20 object-cover"
                />
            ) : (
                <User size={14} className={accentText} />
            )}
            <span>
                By <span className="font-bold text-white">{author.handle ? `@${author.handle}` : author.name}</span>
            </span>
        </div>
    );
}

// ─── Body Content (handles both new blocks and legacy richText) ───────────────

function PostBody({ post, accentText }: { post: NewsPost; accentText: string }) {
    const hasBlocks = Array.isArray(post.contentBlocks) && post.contentBlocks.length > 0;
    const hasLegacyBody = !!post.body;

    if (hasBlocks) {
        return <ContentBlocks blocks={post.contentBlocks ?? []} accentText={accentText} />;
    }
    if (hasLegacyBody) {
        return (
            <div className="text-sm leading-relaxed tracking-[0.04em] text-gray-200">
                <PortableTextRenderer content={post.body} />
            </div>
        );
    }
    return null;
}

// ─── Category Themes ─────────────────────────────────────────────────────────

interface CategoryTheme {
    id: string;
    label: string;
    kicker: string;
    headingTitle: string;
    headingAccent: string;
    titleGradient: string;
    accentText: string;
    accentBorder: string;
    bgGlow: string;
    activePill: string;
    backgroundImage: string;
    tagline: string;
    icon: LucideIcon;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
    all: {
        id: "all",
        label: "All Dispatches",
        kicker: "KMHQ SIGNAL NETWORK // GLOBAL FEED",
        headingTitle: "News &",
        headingAccent: "Intel",
        titleGradient: "from-lime-300 via-lime-400 to-emerald-500",
        accentText: "text-lime-300",
        accentBorder: "border-lime-400/40",
        bgGlow: "rgba(163,230,53,0.22)",
        activePill: "bg-lime-400 text-black border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.4)]",
        backgroundImage: "/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg",
        tagline:
            "Official tactical dispatches, organizational announcements, fleet developments, and operational reports straight from the bridge.",
        icon: Radio,
    },
    announcement: {
        id: "announcement",
        label: "Announcements",
        kicker: "HIGH COMMAND DIRECTIVE // PRIORITY BEACON",
        headingTitle: "Official",
        headingAccent: "Announcements",
        titleGradient: "from-amber-300 via-amber-400 to-yellow-500",
        accentText: "text-amber-300",
        accentBorder: "border-amber-400/50",
        bgGlow: "rgba(251,191,36,0.25)",
        activePill: "bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]",
        backgroundImage: "/backgrounds/SC-4.5.0_20251229_131102_Hathor-orbital-laser_f.png",
        tagline: "Official high-level decrees, org updates, and critical leadership directives.",
        icon: Flame,
    },
    ops: {
        id: "ops",
        label: "Tactical Ops",
        kicker: "COMBAT INTEL // STRIKE FORCE DISPATCHES",
        headingTitle: "Tactical",
        headingAccent: "Operations",
        titleGradient: "from-red-400 via-rose-500 to-amber-500",
        accentText: "text-red-400",
        accentBorder: "border-red-500/50",
        bgGlow: "rgba(248,113,113,0.25)",
        activePill: "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]",
        backgroundImage: "/backgrounds/SC-3.24_20241207_170744_Hornets-Over-Lake_f.png",
        tagline: "PvP strike reports, escort missions, sector defense strategies, and combat debriefs.",
        icon: ShieldAlert,
    },
    fleet: {
        id: "fleet",
        label: "Fleet Updates",
        kicker: "HANGAR REGISTRY // CAPITAL ASSET RECLASSIFICATION",
        headingTitle: "Fleet",
        headingAccent: "Updates",
        titleGradient: "from-cyan-300 via-sky-400 to-blue-500",
        accentText: "text-cyan-300",
        accentBorder: "border-cyan-400/50",
        bgGlow: "rgba(56,189,248,0.25)",
        activePill: "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.5)]",
        backgroundImage: "/backgrounds/SC-3.19_20230524_130313_Fleet-selfie_ILW2953_f.png",
        tagline: "New ship acquisitions, capital ship deployments, logistics routes, and fleet roster changes.",
        icon: Sparkles,
    },
    lore: {
        id: "lore",
        label: "Org Lore",
        kicker: "ARCHIVAL RECORDS // CHRONICLES OF SECTOR 7",
        headingTitle: "Org",
        headingAccent: "Lore & Archives",
        titleGradient: "from-purple-300 via-violet-400 to-fuchsia-500",
        accentText: "text-purple-300",
        accentBorder: "border-purple-400/50",
        bgGlow: "rgba(192,132,252,0.25)",
        activePill: "bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
        backgroundImage: "/backgrounds/SC-4.0_20250102_160626_Fuego-night-sky_f.png",
        tagline: "Deep space histories, squad origins, operational philosophies, and narrative chronicles.",
        icon: Newspaper,
    },
    community: {
        id: "community",
        label: "Community",
        kicker: "CREW NETWORK // SOCIAL & MEMBER HIGHLIGHTS",
        headingTitle: "Community",
        headingAccent: "Dispatches",
        titleGradient: "from-emerald-300 via-teal-400 to-cyan-500",
        accentText: "text-emerald-300",
        accentBorder: "border-emerald-400/50",
        bgGlow: "rgba(52,211,153,0.25)",
        activePill: "bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]",
        backgroundImage: "/backgrounds/SC-3.22_20240110_133821_mT-flower-hill-sunset_f.png",
        tagline: "Member spotlights, casual hangouts, community accomplishments, and event highlights.",
        icon: User,
    },
};

const CATEGORIES = [
    { id: "all", label: "All Dispatches" },
    { id: "announcement", label: "Announcements" },
    { id: "ops", label: "Tactical Ops" },
    { id: "fleet", label: "Fleet Updates" },
    { id: "lore", label: "Org Lore" },
    { id: "community", label: "Community" },
];

const CATEGORY_COLORS: Record<string, string> = {
    announcement: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    ops: "border-red-500/40 bg-red-500/10 text-red-300",
    fleet: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    lore: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    community: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface NewsPageClientProps {
    newsPosts: NewsPost[];
    siteSettings: SiteSetting | null;
    newsPage: NewsPage | null;
}

export default function NewsPageClient({ newsPosts: initialPosts, siteSettings, newsPage }: NewsPageClientProps) {
    const { data: livePosts } = useLivePreview<NewsPost[]>({
        initialData: initialPosts,
        serverURL: getServerUrl(),
        depth: 3,
    });

    const posts = Array.isArray(livePosts) ? livePosts : initialPosts || [];
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const activeTheme = useMemo(() => {
        const base = CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES.all;

        let categoryConfig = null;
        if (selectedCategory === "all") {
            categoryConfig = newsPage?.hero;
        } else if (selectedCategory === "announcement") {
            categoryConfig = newsPage?.announcementHero;
        } else if (selectedCategory === "ops") {
            categoryConfig = newsPage?.opsHero;
        } else if (selectedCategory === "fleet") {
            categoryConfig = newsPage?.fleetHero;
        } else if (selectedCategory === "lore") {
            categoryConfig = newsPage?.loreHero;
        } else if (selectedCategory === "community") {
            categoryConfig = newsPage?.communityHero;
        }

        if (categoryConfig) {
            const headingText = categoryConfig.heading || base.headingTitle + (base.headingAccent ? " " + base.headingAccent : "");
            const parts = headingText.split(" ");
            const accent = parts.pop() || "";
            const title = parts.join(" ") || "";

            return {
                ...base,
                kicker: categoryConfig.kicker || base.kicker,
                headingTitle: title ? `${title} ` : "",
                headingAccent: accent || base.headingAccent,
                tagline: categoryConfig.tagline || base.tagline,
                backgroundImage: categoryConfig.backgroundImage || base.backgroundImage,
            };
        }
        return base;
    }, [selectedCategory, newsPage]);

    const ActiveIcon = activeTheme.icon;

    const displayPosts = posts;

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 0.9,
        });

        let rafId = 0;
        function raf(time: number) {
            if (!document.hidden) lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    const filteredPosts = useMemo(() => {
        return displayPosts.filter((item) => {
            const categoryMatch = selectedCategory === "all" || (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

            const bodyText = typeof item.body === "string" ? item.body : JSON.stringify(item.body || "");
            const blockText = JSON.stringify(item.contentBlocks || "");
            const authorInfo = resolveAuthor(item);
            const authorStr = authorInfo ? `${authorInfo.name} ${authorInfo.handle || ""}` : "";

            const queryLower = searchQuery.toLowerCase().trim();
            const searchMatch =
                !queryLower ||
                (item.title && item.title.toLowerCase().includes(queryLower)) ||
                bodyText.toLowerCase().includes(queryLower) ||
                blockText.toLowerCase().includes(queryLower) ||
                authorStr.toLowerCase().includes(queryLower);

            return categoryMatch && searchMatch;
        });
    }, [displayPosts, selectedCategory, searchQuery]);

    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    const remainingPosts =
        filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts.length === 1 && selectedCategory !== "all" ? filteredPosts : [];

    // Helper: get cover image src
    const getCoverSrc = (item: NewsPost) => mediaUrl(item.coverImage);
    const featuredCover = featuredPost ? getCoverSrc(featuredPost) : null;

    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col bg-[#010301] font-sans tracking-wide text-white transition-colors duration-700 selection:bg-lime-400/30">
            {/* GLOBAL FIXED FULL-PAGE BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTheme.id}
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 0.75, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src={activeTheme.backgroundImage}
                            alt=""
                            fill
                            sizes="100vw"
                            preload
                            unoptimized={isUnoptimized(activeTheme.backgroundImage)}
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                <div
                    className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
                    style={{
                        background: `radial-gradient(ellipse 90% 70% at 50% 20%, ${activeTheme.bgGlow}, transparent 75%), linear-gradient(to bottom, rgba(2,4,2,0.40) 0%, rgba(2,4,2,0.25) 40%, rgba(2,4,2,0.65) 100%)`,
                    }}
                />

                <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>

            <Header siteSettings={siteSettings} />

            <main className="relative z-10 flex w-full flex-1 flex-col">
                {/* HERO */}
                <section className="relative flex w-full items-center justify-center border-b border-white/10 bg-transparent px-4 py-24 transition-all duration-700 md:px-12 md:py-32 lg:px-16">
                    <div className="relative z-10 w-full text-center">
                        <motion.div
                            key={`kicker-${activeTheme.id}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`inline-flex items-center gap-2 rounded-full border px-6 py-2 ${activeTheme.accentBorder} bg-black/60 font-mono text-xs font-black uppercase tracking-[0.45em] backdrop-blur-sm ${activeTheme.accentText} mb-8 shadow-2xl`}
                        >
                            <ActiveIcon size={14} className="animate-pulse" />
                            {activeTheme.kicker}
                        </motion.div>

                        <motion.h1
                            key={`heading-${activeTheme.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mb-8 text-5xl font-black uppercase leading-tight tracking-[0.18em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] md:text-8xl"
                            style={{ letterSpacing: "0.18em" }}
                        >
                            {activeTheme.headingTitle}{" "}
                            <span className={`bg-gradient-to-br bg-clip-text text-transparent ${activeTheme.titleGradient}`}>
                                {activeTheme.headingAccent}
                            </span>
                        </motion.h1>

                        <motion.p
                            key={`tagline-${activeTheme.id}`}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full text-lg font-light uppercase leading-relaxed tracking-[0.08em] text-gray-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] md:text-2xl"
                            style={{ letterSpacing: "0.08em" }}
                        >
                            {activeTheme.tagline}
                        </motion.p>
                    </div>
                </section>

                {/* CONTROLS */}
                <section className="sticky top-[72px] z-30 w-full border-b border-white/10 bg-[#020402]/60 px-4 py-4 shadow-2xl backdrop-blur-md transition-colors duration-500 md:px-12 lg:px-16">
                    <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex w-full flex-wrap items-center gap-2.5 [ms-overflow-style:none] [scrollbar-width:none] md:w-auto [&::-webkit-scrollbar]:hidden">
                            {CATEGORIES.map((cat) => {
                                const isSelected = selectedCategory === cat.id;
                                const catTheme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.all;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`cursor-pointer whitespace-nowrap rounded-xl border px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                                            isSelected
                                                ? catTheme.activePill + " scale-105"
                                                : "border-white/15 bg-black/50 text-gray-200 hover:border-white/40 hover:bg-black/75 hover:text-white"
                                        }`}
                                        style={{ letterSpacing: "0.2em" }}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="relative w-full shrink-0 md:w-80">
                            <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${activeTheme.accentText}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH DISPATCHES..."
                                className={`w-full border bg-black/60 ${activeTheme.accentBorder} rounded-xl py-2.5 pl-10 pr-4 font-mono text-xs uppercase tracking-[0.15em] text-white placeholder-gray-400 outline-none transition-all focus:bg-black/80`}
                                style={{ letterSpacing: "0.15em" }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT */}
                <section className="relative w-full flex-1 bg-transparent px-4 py-12 md:px-12 md:py-20 lg:px-16">
                    <div className="w-full">
                        {filteredPosts.length === 0 ? (
                            <div className="w-full rounded-[2.5rem] border border-white/10 bg-black/50 p-12 py-20 text-center backdrop-blur-md">
                                <ShieldAlert size={48} className={`mx-auto ${activeTheme.accentText} mb-4 opacity-90`} />
                                <h3
                                    className="mb-2 text-2xl font-bold uppercase tracking-[0.2em] text-white"
                                    style={{ letterSpacing: "0.2em" }}
                                >
                                    No Dispatches Found
                                </h3>
                                <p
                                    className="mx-auto mb-6 max-w-md text-sm tracking-[0.08em] text-gray-300"
                                    style={{ letterSpacing: "0.08em" }}
                                >
                                    {searchQuery || selectedCategory !== "all"
                                        ? "No news articles match your filter criteria. Try adjusting your search or category."
                                        : "No dispatches have been published to the KMHQ news feed yet."}
                                </p>
                                {(searchQuery || selectedCategory !== "all") && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setSearchQuery("");
                                        }}
                                        className={`rounded-xl px-6 py-2.5 ${activeTheme.activePill} font-mono text-xs font-bold uppercase tracking-[0.25em] transition-transform hover:scale-105`}
                                        style={{ letterSpacing: "0.25em" }}
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="w-full space-y-16">
                                {/* ── FEATURED POST ─────────────────────────────────────── */}
                                {featuredPost && selectedCategory === "all" && !searchQuery && (
                                    <motion.article
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className={`group relative overflow-hidden rounded-[2.5rem] border ${activeTheme.accentBorder} w-full bg-black/35 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-black/50 md:p-12`}
                                    >
                                        <div
                                            className={`absolute right-0 top-0 rounded-bl-2xl px-6 py-2 ${activeTheme.activePill} flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-[0.35em] shadow-lg`}
                                        >
                                            <Flame size={12} /> Priority Dispatch
                                        </div>

                                        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
                                            {/* Cover Image */}
                                            {featuredCover && (
                                                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 transition-colors group-hover:border-white/30 lg:col-span-5">
                                                    <Image
                                                        src={featuredCover}
                                                        alt={featuredPost.title}
                                                        fill
                                                        sizes="(min-width: 1024px) 40vw, 100vw"
                                                        loading="eager"
                                                        unoptimized={isUnoptimized(featuredCover)}
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className={featuredCover ? "space-y-5 lg:col-span-7" : "space-y-5 lg:col-span-12"}>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span
                                                        className={`font-mono text-xs font-black uppercase tracking-[0.4em] ${activeTheme.accentText} flex items-center gap-1.5`}
                                                    >
                                                        <Calendar size={13} />
                                                        {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </span>
                                                    {featuredPost.category && (
                                                        <span
                                                            className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${CATEGORY_COLORS[(featuredPost.category || "").toLowerCase()] || "border-white/10 bg-white/10 text-gray-300"}`}
                                                        >
                                                            {featuredPost.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <h2
                                                    className="text-3xl font-black uppercase leading-tight tracking-[0.12em] text-white md:text-5xl"
                                                    style={{ letterSpacing: "0.12em" }}
                                                >
                                                    {featuredPost.title}
                                                </h2>

                                                {/* Body / Content Blocks */}
                                                <PostBody post={featuredPost} accentText={activeTheme.accentText} />

                                                <AuthorBadge
                                                    post={featuredPost}
                                                    accentText={activeTheme.accentText}
                                                    className="border-t border-white/10 pt-4"
                                                />
                                            </div>
                                        </div>
                                    </motion.article>
                                )}

                                {/* ── GRID OF DISPATCHES ─────────────────────────────── */}
                                <div className="w-full">
                                    {selectedCategory === "all" && !searchQuery && remainingPosts.length > 0 && (
                                        <div className="mb-8 flex items-center gap-3">
                                            <Newspaper size={18} className={activeTheme.accentText} />
                                            <h3
                                                className="font-mono text-xs font-black uppercase tracking-[0.4em] text-gray-200 drop-shadow"
                                                style={{ letterSpacing: "0.4em" }}
                                            >
                                                Recent Signals & Updates
                                            </h3>
                                            <div className="h-px flex-1 bg-white/20" />
                                        </div>
                                    )}

                                    <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {(selectedCategory !== "all" || searchQuery ? filteredPosts : remainingPosts).map((item, idx) => {
                                            const imageSrc = getCoverSrc(item);
                                            const catKey = (item.category || "").toLowerCase();
                                            const catBadgeClass = CATEGORY_COLORS[catKey] || "border-white/10 bg-white/10 text-gray-300";
                                            const itemTheme = CATEGORY_THEMES[catKey] || activeTheme;
                                            const hasBlocks = Array.isArray(item.contentBlocks) && item.contentBlocks.length > 0;

                                            return (
                                                <motion.article
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 24 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                                                    className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/15 bg-black/35 p-7 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-black/55"
                                                >
                                                    <div className="space-y-5">
                                                        {/* Cover image */}
                                                        {imageSrc && (
                                                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 transition-colors group-hover:border-white/30">
                                                                <Image
                                                                    src={imageSrc}
                                                                    alt={item.title}
                                                                    fill
                                                                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                                                    unoptimized={isUnoptimized(imageSrc)}
                                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Date & category */}
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span
                                                                className={`font-mono text-[11px] font-bold uppercase tracking-[0.35em] ${itemTheme.accentText} flex items-center gap-1`}
                                                            >
                                                                <Calendar size={12} />
                                                                {new Date(item.publishedAt || item.createdAt).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                            {item.category && (
                                                                <span
                                                                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.25em] ${catBadgeClass}`}
                                                                >
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                            {/* Block type indicators */}
                                                            {hasBlocks && (
                                                                <div className="ml-auto flex items-center gap-1 opacity-50">
                                                                    {item.contentBlocks?.some((b) => b.blockType === "imageBlock") && (
                                                                        <ImageIcon size={10} className="text-gray-400" />
                                                                    )}
                                                                    {item.contentBlocks?.some(
                                                                        (b) => b.blockType === "videoBlock" || b.blockType === "embedBlock",
                                                                    ) && <Video size={10} className="text-gray-400" />}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Title */}
                                                        <h3
                                                            className="text-xl font-bold uppercase leading-snug tracking-[0.12em] text-white drop-shadow transition-colors group-hover:text-gray-100"
                                                            style={{ letterSpacing: "0.12em" }}
                                                        >
                                                            {item.title}
                                                        </h3>

                                                        {/* Body (new blocks or legacy) */}
                                                        <div className="line-clamp-[8]">
                                                            <PostBody post={item} accentText={itemTheme.accentText} />
                                                        </div>
                                                    </div>

                                                    {/* Author footer */}
                                                    <AuthorBadge
                                                        post={item}
                                                        accentText={itemTheme.accentText}
                                                        className="mt-6 justify-between border-t border-white/15 pt-4"
                                                    />
                                                </motion.article>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
