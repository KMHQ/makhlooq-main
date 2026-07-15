'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from '@studio-freight/lenis';
import Header from '../../../src/components/Header';
import Footer from '../../../src/components/Footer';
import { PortableTextRenderer } from '../../../src/components/PortableTextRenderer';
import { 
  Radio, 
  Search, 
  Tag, 
  Calendar, 
  User, 
  ExternalLink, 
  Newspaper, 
  Filter,
  Flame,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Code2,
} from 'lucide-react';
import { useLivePreview } from '@payloadcms/live-preview-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a YouTube / Vimeo watch URL to an embeddable src */
function toEmbedSrc(url) {
  if (!url) return null;
  // YouTube: watch?v=ID or youtu.be/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Treat as direct URL otherwise
  return url;
}

/** Is a URL or MIME type pointing to a raw video file? */
function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg|mov)([\?#].*)?$/i.test(url);
}

// ─── Block Renderer ──────────────────────────────────────────────────────────

function ContentBlocks({ blocks, accentText }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-8 w-full">
      {blocks.map((block, idx) => {
        switch (block.blockType) {
          case 'textBlock':
            return (
              <div 
                key={idx} 
                className="relative p-6 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
              >
                <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  COMMS DATA // DECREE_{idx + 1}
                </div>
                <div className="prose prose-invert prose-emerald max-w-none text-gray-300 leading-relaxed text-sm">
                  <PortableTextRenderer content={block.content} />
                </div>
              </div>
            );

          case 'imageBlock': {
            const imgSrc = block.image?.url;
            if (!imgSrc) return null;
            return (
              <figure 
                key={idx} 
                className={`relative group p-4 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 w-full shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${block.fullWidth ? '' : 'max-w-3xl mx-auto'}`}
              >
                <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  VISUAL SCAN // COMP_{idx + 1}
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 relative flex justify-center items-center">
                  <img
                    src={imgSrc}
                    alt={block.image?.alt || block.caption || ''}
                    className="max-w-full h-auto max-h-[70vh] object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-center text-[10px] font-mono text-gray-400 tracking-[0.15em] uppercase select-none">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'videoBlock': {
            const isUrl = block.videoSource === 'url';
            const src = isUrl ? block.videoUrl : block.videoFile?.url;
            if (!src) return null;

            const isDirect = isUrl ? isDirectVideoUrl(src) : true;

            return (
              <figure 
                key={idx} 
                className="relative group p-4 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 w-full max-w-3xl mx-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
              >
                <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  VIDEO TRANSMISSION // CAPTURE_{idx + 1}
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black relative shadow-2xl">
                  {isDirect ? (
                    <video
                      src={src}
                      controls
                      autoPlay={block.autoplay}
                      muted={block.autoplay}
                      loop={block.autoplay}
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      src={toEmbedSrc(src)}
                      title={block.caption || 'Video'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-center text-[10px] font-mono text-gray-400 tracking-[0.15em] uppercase select-none">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'embedBlock': {
            if (!block.url) return null;
            const embedSrc = toEmbedSrc(block.url);
            const isDirect = isDirectVideoUrl(block.url);

            return (
              <figure 
                key={idx} 
                className="relative group p-4 rounded-2xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 w-full max-w-3xl mx-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
              >
                <div className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  EXTERNAL FEED // CONNECT_{idx + 1}
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black relative shadow-2xl">
                  {isDirect ? (
                    <video src={block.url} controls className="w-full h-full object-contain bg-black" />
                  ) : (
                    <iframe
                      src={embedSrc}
                      title={block.caption || 'Embed'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-center text-[10px] font-mono text-gray-400 tracking-[0.15em] uppercase select-none">
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

function resolveAuthor(post) {
  // New: member relationship
  if (post.authorSource === 'member' && post.authorMember) {
    const m = post.authorMember;
    return {
      name: m.name || m.discord_tag || 'Team Member',
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

function AuthorBadge({ post, accentText, className = '' }) {
  const author = resolveAuthor(post);
  if (!author) return null;

  return (
    <div className={`flex items-center gap-2 font-mono text-xs text-gray-300 uppercase tracking-[0.3em] ${className}`}>
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-5 h-5 rounded-full border border-white/20 object-cover"
        />
      ) : (
        <User size={14} className={accentText} />
      )}
      <span>
        By <span className="text-white font-bold">
          {author.handle ? `@${author.handle}` : author.name}
        </span>
      </span>
    </div>
  );
}

// ─── Body Content (handles both new blocks and legacy richText) ───────────────

function PostBody({ post, accentText }) {
  const hasBlocks = Array.isArray(post.contentBlocks) && post.contentBlocks.length > 0;
  const hasLegacyBody = !!post.body;

  if (hasBlocks) {
    return <ContentBlocks blocks={post.contentBlocks} accentText={accentText} />;
  }
  if (hasLegacyBody) {
    return (
      <div className="text-gray-200 text-sm leading-relaxed tracking-[0.04em]">
        <PortableTextRenderer content={post.body} />
      </div>
    );
  }
  return null;
}

// ─── Category Themes ─────────────────────────────────────────────────────────

const CATEGORY_THEMES = {
  all: {
    id: 'all',
    label: 'All Dispatches',
    kicker: 'KMHQ SIGNAL NETWORK // GLOBAL FEED',
    headingTitle: 'News &',
    headingAccent: 'Intel',
    titleGradient: 'from-lime-300 via-lime-400 to-emerald-500',
    accentText: 'text-lime-300',
    accentBorder: 'border-lime-400/40',
    bgGlow: 'rgba(163,230,53,0.22)',
    activePill: 'bg-lime-400 text-black border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.4)]',
    backgroundImage: '/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg',
    tagline: 'Official tactical dispatches, organizational announcements, fleet developments, and operational reports straight from the bridge.',
    icon: Radio,
  },
  announcement: {
    id: 'announcement',
    label: 'Announcements',
    kicker: 'HIGH COMMAND DIRECTIVE // PRIORITY BEACON',
    headingTitle: 'Official',
    headingAccent: 'Announcements',
    titleGradient: 'from-amber-300 via-amber-400 to-yellow-500',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-400/50',
    bgGlow: 'rgba(251,191,36,0.25)',
    activePill: 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]',
    backgroundImage: '/backgrounds/SC-4.5.0_20251229_131102_Hathor-orbital-laser_f.png',
    tagline: 'Official high-level decrees, org updates, and critical leadership directives.',
    icon: Flame,
  },
  ops: {
    id: 'ops',
    label: 'Tactical Ops',
    kicker: 'COMBAT INTEL // STRIKE FORCE DISPATCHES',
    headingTitle: 'Tactical',
    headingAccent: 'Operations',
    titleGradient: 'from-red-400 via-rose-500 to-amber-500',
    accentText: 'text-red-400',
    accentBorder: 'border-red-500/50',
    bgGlow: 'rgba(248,113,113,0.25)',
    activePill: 'bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    backgroundImage: '/backgrounds/SC-3.24_20241207_170744_Hornets-Over-Lake_f.png',
    tagline: 'PvP strike reports, escort missions, sector defense strategies, and combat debriefs.',
    icon: ShieldAlert,
  },
  fleet: {
    id: 'fleet',
    label: 'Fleet Updates',
    kicker: 'HANGAR REGISTRY // CAPITAL ASSET RECLASSIFICATION',
    headingTitle: 'Fleet',
    headingAccent: 'Updates',
    titleGradient: 'from-cyan-300 via-sky-400 to-blue-500',
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/50',
    bgGlow: 'rgba(56,189,248,0.25)',
    activePill: 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.5)]',
    backgroundImage: '/backgrounds/SC-3.19_20230524_130313_Fleet-selfie_ILW2953_f.png',
    tagline: 'New ship acquisitions, capital ship deployments, logistics routes, and fleet roster changes.',
    icon: Sparkles,
  },
  lore: {
    id: 'lore',
    label: 'Org Lore',
    kicker: 'ARCHIVAL RECORDS // CHRONICLES OF SECTOR 7',
    headingTitle: 'Org',
    headingAccent: 'Lore & Archives',
    titleGradient: 'from-purple-300 via-violet-400 to-fuchsia-500',
    accentText: 'text-purple-300',
    accentBorder: 'border-purple-400/50',
    bgGlow: 'rgba(192,132,252,0.25)',
    activePill: 'bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    backgroundImage: '/backgrounds/SC-4.0_20250102_160626_Fuego-night-sky_f.png',
    tagline: 'Deep space histories, squad origins, operational philosophies, and narrative chronicles.',
    icon: Newspaper,
  },
  community: {
    id: 'community',
    label: 'Community',
    kicker: 'CREW NETWORK // SOCIAL & MEMBER HIGHLIGHTS',
    headingTitle: 'Community',
    headingAccent: 'Dispatches',
    titleGradient: 'from-emerald-300 via-teal-400 to-cyan-500',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/50',
    bgGlow: 'rgba(52,211,153,0.25)',
    activePill: 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]',
    backgroundImage: '/backgrounds/SC-3.22_20240110_133821_mT-flower-hill-sunset_f.png',
    tagline: 'Member spotlights, casual hangouts, community accomplishments, and event highlights.',
    icon: User,
  },
};

const CATEGORIES = [
  { id: 'all', label: 'All Dispatches' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'ops', label: 'Tactical Ops' },
  { id: 'fleet', label: 'Fleet Updates' },
  { id: 'lore', label: 'Org Lore' },
  { id: 'community', label: 'Community' },
];

const CATEGORY_COLORS = {
  announcement: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  ops: 'border-red-500/40 bg-red-500/10 text-red-300',
  fleet: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  lore: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  community: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsPageClient({ newsPosts: initialPosts, siteSettings, newsPage }) {
  const { data: livePosts } = useLivePreview({
    initialData: initialPosts,
    serverURL: (typeof window !== 'undefined' && window.__SERVER_URL__) || process.env.NEXT_PUBLIC_SERVER_URL || 'https://kmhq.org',
    depth: 3,
  });

  const posts = Array.isArray(livePosts) ? livePosts : (initialPosts || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientNews, setClientNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeTheme = useMemo(() => {
    const base = CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES.all;
    
    let categoryConfig = null;
    if (selectedCategory === 'all') {
      categoryConfig = newsPage?.hero;
    } else if (selectedCategory === 'announcement') {
      categoryConfig = newsPage?.announcementHero;
    } else if (selectedCategory === 'ops') {
      categoryConfig = newsPage?.opsHero;
    } else if (selectedCategory === 'fleet') {
      categoryConfig = newsPage?.fleetHero;
    } else if (selectedCategory === 'lore') {
      categoryConfig = newsPage?.loreHero;
    } else if (selectedCategory === 'community') {
      categoryConfig = newsPage?.communityHero;
    }

    if (categoryConfig) {
      const headingText = categoryConfig.heading || base.headingTitle + (base.headingAccent ? ' ' + base.headingAccent : '');
      const parts = headingText.split(' ');
      const accent = parts.pop() || '';
      const title = parts.join(' ') || '';

      return {
        ...base,
        kicker: categoryConfig.kicker || base.kicker,
        headingTitle: title ? `${title} ` : '',
        headingAccent: accent || base.headingAccent,
        tagline: categoryConfig.tagline || base.tagline,
        backgroundImage: categoryConfig.backgroundImage || base.backgroundImage,
      };
    }
    return base;
  }, [selectedCategory, newsPage]);

  const ActiveIcon = activeTheme.icon;

  useEffect(() => {
    if (posts.length > 0) return;
    let mounted = true;
    setLoading(true);

    fetch('/api/about-news')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setClientNews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setClientNews([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [posts.length]);

  const displayPosts = posts.length > 0 ? posts : clientNews;

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      wheelMultiplier: 0.9,
    });

    let rafId;
    function raf(time) {
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
      const categoryMatch =
        selectedCategory === 'all' ||
        (item.category || item.media_type || '').toLowerCase() === selectedCategory.toLowerCase();

      const bodyText = typeof item.body === 'string' ? item.body : JSON.stringify(item.body || '');
      const blockText = JSON.stringify(item.contentBlocks || '');
      const authorInfo = resolveAuthor(item);
      const authorStr = authorInfo ? `${authorInfo.name} ${authorInfo.handle || ''}` : '';

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
  const remainingPosts = filteredPosts.length > 1
    ? filteredPosts.slice(1)
    : (filteredPosts.length === 1 && selectedCategory !== 'all' ? filteredPosts : []);

  // Helper: get cover image src
  const getCoverSrc = (item) =>
    item.coverImage?.url ||
    item.coverImage?.asset?.url ||
    (item.media_type === 'image' ? item.media_url : null);

  return (
    <div className="min-h-[100dvh] w-full bg-[#010301] relative text-white selection:bg-lime-400/30 flex flex-col font-sans transition-colors duration-700 tracking-wide">

      {/* GLOBAL FIXED FULL-PAGE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url('${activeTheme.backgroundImage}')` }}
          />
        </AnimatePresence>

        <div
          className="absolute inset-0 z-0 transition-all duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 50% 20%, ${activeTheme.bgGlow}, transparent 75%), linear-gradient(to bottom, rgba(2,4,2,0.40) 0%, rgba(2,4,2,0.25) 40%, rgba(2,4,2,0.65) 100%)`
          }}
        />

        <div className="absolute inset-0 pointer-events-none opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <Header siteSettings={siteSettings} />

      <main className="flex-1 flex flex-col w-full relative z-10">

        {/* HERO */}
        <section className="relative w-full py-24 md:py-32 px-4 md:px-12 lg:px-16 flex items-center justify-center border-b border-white/10 transition-all duration-700 bg-transparent">
          <div className="relative z-10 w-full text-center">
            <motion.div
              key={`kicker-${activeTheme.id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border ${activeTheme.accentBorder} bg-black/60 backdrop-blur-sm font-mono text-xs font-black uppercase tracking-[0.45em] ${activeTheme.accentText} mb-8 shadow-2xl`}
            >
              <ActiveIcon size={14} className="animate-pulse" />
              {activeTheme.kicker}
            </motion.div>

            <motion.h1
              key={`heading-${activeTheme.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black uppercase tracking-[0.18em] text-white leading-tight mb-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
              style={{ letterSpacing: '0.18em' }}
            >
              {activeTheme.headingTitle}{' '}
              <span className={`text-transparent bg-clip-text bg-gradient-to-br ${activeTheme.titleGradient}`}>
                {activeTheme.headingAccent}
              </span>
            </motion.h1>

            <motion.p
              key={`tagline-${activeTheme.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full text-lg md:text-2xl text-gray-100 leading-relaxed font-light tracking-[0.08em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase"
              style={{ letterSpacing: '0.08em' }}
            >
              {activeTheme.tagline}
            </motion.p>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="sticky top-[72px] z-30 w-full bg-[#020402]/60 backdrop-blur-md border-b border-white/10 py-4 px-4 md:px-12 lg:px-16 shadow-2xl transition-colors duration-500">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const catTheme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.all;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap border cursor-pointer ${
                      isSelected
                        ? catTheme.activePill + ' scale-105'
                        : 'bg-black/50 border-white/15 text-gray-200 hover:border-white/40 hover:text-white hover:bg-black/75'
                    }`}
                    style={{ letterSpacing: '0.2em' }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80 shrink-0">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${activeTheme.accentText}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH DISPATCHES..."
                className={`w-full bg-black/60 border ${activeTheme.accentBorder} rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-400 outline-none focus:bg-black/80 transition-all uppercase tracking-[0.15em]`}
                style={{ letterSpacing: '0.15em' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="relative w-full py-12 md:py-20 px-4 md:px-12 lg:px-16 bg-transparent flex-1">
          <div className="w-full">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <span className="font-mono text-xs uppercase tracking-[0.35em] text-gray-200">Decrypting Dispatches...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center border border-white/10 rounded-[2.5rem] bg-black/50 p-12 backdrop-blur-md w-full">
                <ShieldAlert size={48} className={`mx-auto ${activeTheme.accentText} opacity-90 mb-4`} />
                <h3 className="text-2xl font-bold uppercase tracking-[0.2em] text-white mb-2" style={{ letterSpacing: '0.2em' }}>No Dispatches Found</h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto mb-6 tracking-[0.08em]" style={{ letterSpacing: '0.08em' }}>
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No news articles match your filter criteria. Try adjusting your search or category.'
                    : 'No dispatches have been published to the KMHQ news feed yet.'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className={`px-6 py-2.5 rounded-xl ${activeTheme.activePill} font-mono font-bold text-xs uppercase tracking-[0.25em] transition-transform hover:scale-105`}
                    style={{ letterSpacing: '0.25em' }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-16 w-full">

                {/* ── FEATURED POST ─────────────────────────────────────── */}
                {featuredPost && selectedCategory === 'all' && !searchQuery && (
                  <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`group relative overflow-hidden rounded-[2.5rem] border ${activeTheme.accentBorder} bg-black/35 backdrop-blur-md p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] hover:border-white/40 hover:bg-black/50 transition-all duration-500 w-full`}
                  >
                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl ${activeTheme.activePill} font-mono font-black text-[10px] uppercase tracking-[0.35em] flex items-center gap-1.5 shadow-lg`}>
                      <Flame size={12} /> Priority Dispatch
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                      {/* Cover Image */}
                      {getCoverSrc(featuredPost) && (
                        <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-white/10 aspect-video relative group-hover:border-white/30 transition-colors w-full">
                          {featuredPost.media_type === 'video' || (featuredPost.media_url && featuredPost.media_url.match(/\.(mp4|webm|ogg)(\?.*)?$/)) ? (
                            <video controls src={featuredPost.media_url} className="w-full h-full object-cover bg-black" />
                          ) : (
                            <img
                              src={getCoverSrc(featuredPost)}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className={getCoverSrc(featuredPost) ? 'lg:col-span-7 space-y-5' : 'lg:col-span-12 space-y-5'}>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`font-mono text-xs font-black uppercase tracking-[0.4em] ${activeTheme.accentText} flex items-center gap-1.5`}>
                            <Calendar size={13} />
                            {new Date(featuredPost.publishedAt || featuredPost.published_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                          {(featuredPost.category || featuredPost.media_type) && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.25em] border ${CATEGORY_COLORS[(featuredPost.category || '').toLowerCase()] || 'border-white/10 bg-white/10 text-gray-300'}`}>
                              {featuredPost.category || featuredPost.media_type}
                            </span>
                          )}
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.12em] text-white leading-tight" style={{ letterSpacing: '0.12em' }}>
                          {featuredPost.title}
                        </h2>

                        {/* Body / Content Blocks */}
                        <PostBody post={featuredPost} accentText={activeTheme.accentText} />

                        <AuthorBadge
                          post={featuredPost}
                          accentText={activeTheme.accentText}
                          className="pt-4 border-t border-white/10"
                        />
                      </div>
                    </div>
                  </motion.article>
                )}

                {/* ── GRID OF DISPATCHES ─────────────────────────────── */}
                <div className="w-full">
                  {selectedCategory === 'all' && !searchQuery && remainingPosts.length > 0 && (
                    <div className="mb-8 flex items-center gap-3">
                      <Newspaper size={18} className={activeTheme.accentText} />
                      <h3 className="font-mono text-xs font-black uppercase tracking-[0.4em] text-gray-200 drop-shadow" style={{ letterSpacing: '0.4em' }}>
                        Recent Signals & Updates
                      </h3>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
                    {(selectedCategory !== 'all' || searchQuery ? filteredPosts : remainingPosts).map((item, idx) => {
                      const imageSrc = getCoverSrc(item);
                      const catKey = (item.category || '').toLowerCase();
                      const catBadgeClass = CATEGORY_COLORS[catKey] || 'border-white/10 bg-white/10 text-gray-300';
                      const itemTheme = CATEGORY_THEMES[catKey] || activeTheme;
                      const hasBlocks = Array.isArray(item.contentBlocks) && item.contentBlocks.length > 0;

                      return (
                        <motion.article
                          key={item._id || item.id || idx}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/15 bg-black/35 p-7 hover:border-white/40 hover:bg-black/55 transition-all duration-300 backdrop-blur-md shadow-2xl w-full"
                        >
                          <div className="space-y-5">
                            {/* Cover image */}
                            {imageSrc && (
                              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video relative group-hover:border-white/30 transition-colors w-full">
                                <img
                                  src={imageSrc}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              </div>
                            )}

                            {/* Date & category */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.35em] ${itemTheme.accentText} flex items-center gap-1`}>
                                <Calendar size={12} />
                                {new Date(item.publishedAt || item.published_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric',
                                })}
                              </span>
                              {(item.category || item.media_type) && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.25em] border ${catBadgeClass}`}>
                                  {item.category || item.media_type}
                                </span>
                              )}
                              {/* Block type indicators */}
                              {hasBlocks && (
                                <div className="ml-auto flex items-center gap-1 opacity-50">
                                  {item.contentBlocks.some(b => b.blockType === 'imageBlock') && <ImageIcon size={10} className="text-gray-400" />}
                                  {item.contentBlocks.some(b => b.blockType === 'videoBlock' || b.blockType === 'embedBlock') && <Video size={10} className="text-gray-400" />}
                                </div>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold uppercase tracking-[0.12em] text-white group-hover:text-gray-100 transition-colors leading-snug drop-shadow" style={{ letterSpacing: '0.12em' }}>
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
                            className="mt-6 pt-4 border-t border-white/15 justify-between"
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

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
