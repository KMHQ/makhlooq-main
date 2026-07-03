'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, Users, Crown, Shield,
  Sword, User, X, ChevronRight, Calendar, Activity,
  Plus, Upload, Palette, Shield as ShieldIcon, LogIn,
  Terminal, Wifi, WifiOff, Clock, Zap, LogOut, RefreshCw
} from 'lucide-react';
import ProfileEditor from './ProfileEditor';
import RanksRolesChart from './RanksRolesChart';

// ============================================================
// CONSTANTS
// ============================================================

const ROLES = [
  'High Council', 'Advisor', 'Quaid - Founder', 'KMHQ'
];

const CATEGORIES = [
  'Field Marshal',
  'General',
  'Commander',
  'Colonel',
  'Major',
  'Captain',
  'Officer',
  'Lieutenant',
  'Sergeant',
  'Corporal',
  'Soldier',
  'Citizen',
  'Makhlooq'
];

const SEC_LEVELS = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

const STATUS_META = {
  active:   { color: '#00ff41', label: 'ACTIVE',   dot: 'bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse' },
  inactive: { color: '#2a3a2a', label: 'INACTIVE', dot: 'bg-[#1a3020]' },
};

const PRESET_COLORS = [
  '#10b981','#34d399','#6ee7b7','#a78bfa',
  '#f59e0b','#ef4444','#3b82f6','#ec4899',
  '#06b6d4','#84cc16','#f97316','#8b5cf6'
];

const FLAIR_ORDER = {
  'Quaid - Founder': 1,
  'High Council': 2,
  'Advisor': 3,
  'KMHQ': 4
};

const RANK_ORDER = {
  'Field Marshal': 1,
  'General': 2,
  'Commander': 3,
  'Colonel': 4,
  'Major': 5,
  'Captain': 6,
  'Officer': 7,
  'Lieutenant': 8,
  'Sergeant': 9,
  'Corporal': 10,
  'Soldier': 11,
  'Citizen': 12,
  'Makhlooq': 13
};

const ICON_MAP = {
  crown: Crown,
  shield: Shield,
  sword: Sword,
  users: Users,
  zap: Zap,
  terminal: Terminal
};

const AWARD_TIERS = {
  Ustad: { label: 'Ustad (19 Merits)', suffix: '_1' },
  Uncle: { label: 'Uncle (13 Merits)', suffix: '_2' },
  Launda: { label: 'Launda (7 Merits)', suffix: '_3' },
  Charsi: { label: 'Charsi (3 Merits)', suffix: '_4' }
};

const AWARD_CATEGORIES = {
  Shaqafat: { label: 'Shaqafat (Valor & Combat)', filePrefix: 'Shaqafat' },
  Safir: { label: 'Safir (Navigations)', filePrefix: 'safir' },
  Ittehad: { label: 'Ittehad (Teamwork)', filePrefix: 'ittehad' },
  Khidmat: { label: 'Khidmat (Service & Dedication)', filePrefix: 'khidmat' },
  Alamgiri: { label: 'Alamgiri (Strategist)', filePrefix: 'alamgiri' },
  Sultani: { label: 'Sultani (Diplomacy)', filePrefix: 'sultani' },
  Khazana: { label: 'Khazana (Generosity)', filePrefix: 'khazana' },
  Rehla: { label: 'Rehla (Discovery)', filePrefix: 'rehla' },
  Naqsha: { label: 'Naqsha (Exploration & Mapping)', filePrefix: 'naqsha' },
  Shaheen: { label: 'Shaheen (Ariel Dominance)', filePrefix: 'shaheen' },
  Sipar: { label: 'Sipar (Defense)', filePrefix: 'sipar' },
  Bandook: { label: 'Bandook (High Value Kills)', filePrefix: 'bandook' },
  Nusrat: { label: 'Nusrat (Medical Support)', filePrefix: 'nusrat' },
  Mistri: { label: 'Mistri (Engineering Support)', filePrefix: 'mistri' }
};

const AWARD_DETAILS = {
  Shaqafat: {
    desc: 'For unmatched bravery and domination in battle, defending the fleet and seizing victory.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Safir: {
    desc: 'For exceptional navigation and piloting, ensuring mission success and survival against the odds.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Ittehad: {
    desc: 'For outstanding teamwork and leadership in major operations, keeping the fleet united under fire.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Khidmat: {
    desc: 'For unwavering commitment and selfless contributions to the fleet\'s goals and welfare.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Alamgiri: {
    desc: 'For significant strides in developing the RoE and the fleet\'s strategic backbone and operation SOPs.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Sultani: {
    desc: 'For forging alliances, discovering uncharted systems, and expanding the influence of Khalai Makhlooq.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Khazana: {
    desc: 'For significant material or financial support that empowers the fleet’s strength and survival.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Rehla: {
    desc: 'For discovering new systems, planets, and starpaths.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Naqsha: {
    desc: 'For mapping valuable zones and hidden resources.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Shaheen: {
    desc: 'For aerial dominance and unmatched dogfighting.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Sipar: {
    desc: 'For defending vital assets and comrades against overwhelming odds.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Bandook: {
    desc: 'For elite marksmanship and critical kills in combat, clearing the field of threats.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Nusrat: {
    desc: 'For life-saving medical, logistical, and morale support.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  },
  Mistri: {
    desc: 'For engineering support under enemy fire.',
    requirement: { Ustad: '19 Merits', Uncle: '13 Merits', Launda: '7 Merits', Charsi: '3 Merits' }
  }
};

const getAwardImage = (category, tier) => {
  const prefix = AWARD_CATEGORIES[category]?.filePrefix;
  const suffix = AWARD_TIERS[tier]?.suffix;
  if (!prefix || !suffix) return null;
  return `/KMHQ Awards/${prefix}${suffix}.png`;
};

// ============================================================
// UTILS
// ============================================================

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
};

const getRoleConfig = (role) => {
  const r = role?.toLowerCase() || '';
  if (r.includes('founder') || r.includes('quaid'))
    return { Icon: Crown,  accent: '#fbbf24', label: 'FOUNDER' };
  if (r.includes('council'))
    return { Icon: Shield, accent: '#f87171', label: 'COUNCIL' };
  if (r.includes('advisor'))
    return { Icon: Terminal, accent: '#60a5fa', label: 'ADVISOR' };
  if (r.includes('kmhq'))
    return { Icon: Zap,      accent: '#10b981', label: 'KMHQ' };
  return { Icon: Users, accent: '#00ff41', label: 'CREW' };
};

// ============================================================
// MEMBER CARD
// ============================================================

const MemberCard = ({ member, onClick }) => {
  const { Icon: fallbackIcon, accent: fallbackAccent } = getRoleConfig(member.role);
  const accent = member.flair_color || fallbackAccent || '#10b981';
  const frameColor = member.node_color || accent;
  const Icon = member.flair_icon === 'none' ? null : (ICON_MAP[member.flair_icon?.toLowerCase()] || fallbackIcon);
  const status = STATUS_META[member.status] || STATUS_META.inactive;
  const initial = member.name?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(member)}
      className="group cursor-pointer relative overflow-hidden rounded-[2rem] border border-lime-300/10 bg-white/[0.03] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(4,12,5,0.86) 52%, rgba(2,5,3,0.94) 100%)',
        fontFamily: "Inter, system-ui, sans-serif",
        transition: 'border-color 0.2s',
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
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `linear-gradient(90deg, transparent, ${frameColor}, transparent)` }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,#00000012 3px,#00000012 4px)' }} />

      {/* Corner accents */}
      {['top-0 left-0 border-t border-l','top-0 right-0 border-t border-r',
        'bottom-0 left-0 border-b border-l','bottom-0 right-0 border-b border-r'].map((c,i) => (
        <div key={i}
          className={`absolute w-3 h-3 ${c} opacity-0 group-hover:opacity-100 transition-all duration-200`}
          style={{ borderColor: frameColor }} />
      ))}

      {/* Glitch bar */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: frameColor, animation: 'bar-flicker 0.5s steps(3) infinite' }} />

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
            {member.discord_uid || '--------'}
          </span>
        </div>

        {/* Avatar + Name */}
        <div className="mb-5 flex items-start gap-4">
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden text-2xl font-black"
            style={{
              background: `${frameColor}15`,
              border: `1px solid ${frameColor}40`,
              clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',
              color: frameColor,
            }}
          >
            {member.avatar_url
              ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
              : <span className="group-hover:animate-[text-glitch_0.6s_steps(1)_infinite]">{initial}</span>
            }
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-lime-200">{member.name}</h3>
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3 py-1 bg-emerald-500/10 border border-emerald-500/20"
              style={{
                color: accent,
                background: `${accent}12`,
                borderColor: `${accent}30`,
                borderRadius: '999px',
              }}
            >
              {Icon && <Icon size={12} />}
              {member.role || 'KMHQ'}
            </span>
          </div>
        </div>

        {/* Awards list preview */}
        {member.awards && member.awards.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {member.awards.map((award, i) => {
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
          <span className="uppercase text-lime-100/50">{member.category || 'Makhlooq'}</span>
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
// STATS BAR
// ============================================================

const StatsBar = ({ members }) => {
  const active  = members.filter(m => m.status === 'active').length;
  const command = members.filter(m =>
    ['founder', 'council', 'advisor'].some(r => m.role?.toLowerCase().includes(r))
  ).length;

  const stats = [
    { label: 'Crew', value: members.length,  color: '#ffffff', Icon: Users    },
    { label: 'Active Now',    value: active,           color: '#10b981', Icon: Wifi, pulse: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-lime-300/10 bg-white/[0.035] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.20)] transition-colors hover:border-lime-300/25 hover:bg-lime-300/[0.045] flex items-center gap-4"
        >
          <div className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 flex items-center justify-center">
            <s.Icon size={18} className="text-lime-100/70" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-[-0.06em] text-white">{s.value}</span>
              {s.pulse && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-100/35 mt-0.5">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// FILTER BAR
// ============================================================

const FilterBar = ({ search, setSearch, roleFilter, setRoleFilter, categoryFilter, setCategoryFilter, availableRoles = [] }) => (
  <div className="grid gap-4 rounded-[2rem] border border-lime-300/10 bg-black/35 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:grid-cols-[1.7fr_1fr_1fr]">
    <div className="space-y-2">
      <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Crew Search</label>
      <div className="relative group">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-100/30 transition-colors group-focus-within:text-lime-200/70" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Enter name, tag or bio..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.045] py-4 pl-12 pr-4 text-base text-white transition-all placeholder:text-white/25 focus:border-lime-300/35 focus:bg-lime-300/[0.055] focus:outline-none"
        />
      </div>
    </div>

    <div className="space-y-2">
      <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Flair</label>
      <select
        value={roleFilter}
        onChange={e => setRoleFilter(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-base text-white transition-all hover:bg-lime-300/[0.055] focus:border-lime-300/35 focus:outline-none"
      >
        <option value="" className="bg-[#0a0a0a]">All Flairs</option>
        {availableRoles.map(role => <option key={role} value={role} className="bg-[#0a0a0a]">{role}</option>)}
      </select>
    </div>

    <div className="space-y-2">
      <label className="px-1 text-sm font-black uppercase tracking-[0.18em] text-lime-100/45">Rank</label>
      <select
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-base text-white transition-all hover:bg-lime-300/[0.055] focus:border-lime-300/35 focus:outline-none"
      >
        <option value="" className="bg-[#0a0a0a]">All Ranks</option>
        {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>)}
      </select>
    </div>
  </div>
);

// ============================================================
// PROFILE MODAL
// ============================================================

const ProfileModal = ({ member, onClose }) => {
  if (!member) return null;
  const { Icon: fallbackIcon, accent: fallbackAccent } = getRoleConfig(member.role);
  const accent = member.flair_color || fallbackAccent || '#10b981';
  const frameColor = member.node_color || accent;
  const Icon = member.flair_icon === 'none' ? null : (ICON_MAP[member.flair_icon?.toLowerCase()] || fallbackIcon);
  const status = STATUS_META[member.status] || STATUS_META.inactive;
  const initial = member.name?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: 'rgba(1, 8, 3, 0.9)' }}
    >
      <motion.div
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #020f05 0%, #010c04 100%)',
          border: `1px solid ${frameColor}40`,
          borderRadius: '4px',
          fontFamily: "'Rajdhani', sans-serif",
          boxShadow: `0 0 60px ${frameColor}10`,
        }}
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* HUD Header */}
        <div className="flex items-center justify-between px-4 h-9 border-b" style={{ borderColor: `${frameColor}25`, background: `${frameColor}08` }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-sm animate-pulse" style={{ background: frameColor }} />
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: frameColor }}>
              CITIZEN_DOSSIER // ACCESS_GRANTED
            </span>
          </div>
          <button onClick={onClose} className="transition-colors p-1" style={{ color: frameColor }}>
            <X size={14} />
          </button>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,#00000018 3px,#00000018 4px)' }} />

        {/* Corner brackets */}
        {['top-2 left-2 border-t border-l','top-2 right-2 border-t border-r',
          'bottom-2 left-2 border-b border-l','bottom-2 right-2 border-b border-r'].map((c,i) => (
          <div key={i} className={`absolute w-4 h-4 ${c} pointer-events-none`}
            style={{ borderColor: `${frameColor}50` }} />
        ))}

        <div className="relative px-6 pt-5 pb-6">
          {/* Top section */}
          <div className="flex gap-5 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-24 h-24 flex items-center justify-center text-4xl font-bold overflow-hidden"
                style={{
                  background: `${frameColor}10`,
                  border: `2px solid ${frameColor}60`,
                  clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
                  color: frameColor,
                }}
              >
                {member.avatar_url
                  ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                  : <span className="animate-[text-glitch_1.5s_steps(1)_infinite]">{initial}</span>
                }
              </div>
              {/* Status pill */}
              <div className="mt-2 flex items-center justify-center gap-1.5 py-1 border font-mono text-[8px] tracking-widest uppercase"
                style={{ borderColor: `${frameColor}25`, background: `${frameColor}08`, color: frameColor }}>
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </div>
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-2">
                {member.name || 'UNKNOWN_SUBJECT'}
              </h2>
              <div
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2 py-1 mb-3"
                style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius:'2px' }}
              >
                {Icon && <Icon size={10} />}{member.role || 'KMHQ'}
              </div>
              {/* Meta fields */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'RANK', val: member.category || 'Makhlooq' },
                  { label: 'DEPLOYED', val: formatDate(member.joined_at) },
                  { label: 'CLEARANCE', val: (member.sec_level && SEC_LEVELS.includes(member.sec_level)) ? member.sec_level : 'R0' },
                  { label: 'UID', val: member.discord_uid || '0x??????' },
                ].map(f => (
                  <div key={f.label} className="border-l-2 pl-2" style={{ borderColor: `${frameColor}30` }}>
                    <div className="font-mono text-[7px] tracking-[0.2em] text-[#2a5c35] uppercase mb-0.5">{f.label}</div>
                    <div className="font-mono text-[10px] text-white uppercase tracking-wide truncate">{f.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Awards */}
          {member.awards && member.awards.length > 0 && (
            <div className="border-t pt-4 pb-2" style={{ borderColor: `${frameColor}15` }}>
              <div className="font-mono text-[8px] tracking-[0.2em] text-[#2a5c35] uppercase mb-3">SERVICE_AWARDS //</div>
              <div className="flex flex-wrap gap-3">
                {member.awards.map((award, i) => {
                  const imgUrl = getAwardImage(award.category, award.tier);
                  const details = AWARD_DETAILS[award.category];
                  const title = `${award.category} - ${award.tier}`;
                  return (
                    <div key={i} className="group/award relative flex items-center gap-2 p-1.5 rounded bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all">
                      {imgUrl && (
                        <img src={imgUrl} alt={title} className="w-8 h-8 object-contain" />
                      )}
                      <div className="flex flex-col pr-1">
                        <span className="font-mono text-[10px] text-white font-bold leading-none">{award.category}</span>
                        <span className="font-mono text-[8px] text-emerald-400 font-medium mt-0.5">{award.tier}</span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover/award:block bg-[#020d05] border border-emerald-500/30 p-3 rounded shadow-xl text-left z-50 pointer-events-none">
                        <div className="font-bold text-[10px] text-white uppercase tracking-wider">{award.category} ({award.tier})</div>
                        {details && (
                          <div className="text-[9px] text-gray-400 mt-1 leading-normal font-sans">{details.desc}</div>
                        )}
                        {details && details.requirement[award.tier] && (
                          <div className="text-[8px] text-emerald-500 font-mono mt-1.5">Requirement: {details.requirement[award.tier]}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="border-t pt-4" style={{ borderColor: `${frameColor}15` }}>
            <div className="font-mono text-[8px] tracking-[0.2em] text-[#2a5c35] uppercase mb-2">SUBJECT_BIO //</div>
            <p className="font-mono text-[11px] leading-relaxed" style={{ color: `${frameColor}90` }}>
              {member.bio || 'NO BIO DATA FOUND'}
            </p>
          </div>
        </div>

        {/* Footer shimmer */}
        <div className="h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${frameColor}40, transparent)` }} />
      </motion.div>
    </motion.div>
  );
};

// ============================================================
// JOIN CTA
// ============================================================

const JoinCommunityCTA = ({ joinCTA = {} }) => (
  <section className="relative mt-20 overflow-hidden">
    <div
      className="relative p-12 text-center overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-xl"
    >
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
            <>Join <span className="text-white/40 font-light italic">Khalai Makhlooq</span>'s space crew</>
          )}
        </h2>
        <p className="text-white/40 text-sm max-w-lg font-medium leading-relaxed">
          {joinCTA.description || "Join the crew, see the ships, and grow your rank through organized action."}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <a
            href={joinCTA.discordLink || "https://discord.gg/K7SfxPSwXk"} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-2xl hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            {joinCTA.discordLinkText || "Join on Discord"} <ChevronRight size={16} />
          </a>
          <button
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-sm tracking-widest uppercase rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            {joinCTA.learnMoreText || "Learn More"}
          </button>
        </div>
      </div>
    </div>
  </section>
);


// ============================================================
// ADD MEMBER MODAL
// ============================================================

const AddMemberModal = ({ onClose, onAdded }) => {
  const blank = {
    discord_uid:'', discord_tag:'', name:'', role:'KMHQ',
    category:'Makhlooq', sec_level:'R0', node_color:'#10b981', bio:'', status:'active', is_admin:false, avatar_url:'',
    flair_color:'#10b981', flair_icon:'zap', awards: []
  };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  
  const save = async () => {
    if (!form.discord_uid || !form.name) { setError('Discord UID and name are required.'); return; }
    setSaving(true);
    const res = await fetch('/api/team-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Failed to deploy member.'); setSaving(false); return; }
    onAdded(); onClose();
  };

  const inputCls = "w-full px-4 py-3 text-sm text-emerald-400 placeholder:text-emerald-900 focus:outline-none transition-all";
  const inputStyle = { background:'#020d05', border:'1px solid #0f3a18', borderRadius:'12px', fontFamily:"'Share Tech Mono', monospace" };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ background: 'rgba(2,13,5,0.95)' }}
    >
      <motion.div
        className="w-full max-w-md overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        style={{ background:'#020d05', border:'1px solid #0f5c1e', borderRadius:'24px' }}
        initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-500 uppercase font-bold">Add New Member</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {[
            { label:'DISCORD_UID *', key:'discord_uid', type:'text', placeholder: 'e.g. 309682434507800578' },
            { label:'DISCORD_TAG',   key:'discord_tag', type:'text', placeholder: 'e.g. Commander#0001' },
            { label:'DISPLAY_NAME *',key:'name',        type:'text', placeholder: 'e.g. John Doe' },
            { label:'AVATAR_URL',    key:'avatar_url',  type:'url',  placeholder: 'https://...'  },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">{f.label}</label>
              <input type={f.type} value={form[f.key]}
                placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={inputCls} style={inputStyle}
              />
            </div>
          ))}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">FLAIR (CUSTOM WRITABLE)</label>
              <input type="text" value={form.role}
                placeholder="e.g. Rogue Architect"
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className={inputCls} style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">FLAIR ICON</label>
                <select value={form.flair_icon} onChange={e => setForm(p => ({ ...p, flair_icon: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, color:'#10b981' }}>
                  {['crown', 'shield', 'sword', 'users', 'zap', 'terminal', 'none'].map(o => (
                    <option key={o} value={o} className="bg-[#020d05]">{o.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">STATUS</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, color:'#10b981' }}>
                  {['active', 'inactive'].map(o => (
                    <option key={o} value={o} className="bg-[#020d05]">{o.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">FLAIR COLOR</label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, flair_color: c }))}
                    className="aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-95"
                    style={{ background:c, borderColor: form.flair_color===c ? 'white' : 'transparent', boxShadow: form.flair_color===c ? `0 0 15px ${c}40` : 'none' }} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">RANK</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, color:'#10b981' }}>
                  {CATEGORIES.map(o => <option key={o} value={o} className="bg-[#020d05]">{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">CLEARANCE</label>
                <select value={form.sec_level} onChange={e => setForm(p => ({ ...p, sec_level: e.target.value }))}
                  className={inputCls} style={{ ...inputStyle, color:'#10b981' }}>
                  {SEC_LEVELS.map(o => <option key={o} value={o} className="bg-[#020d05]">{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">BIO</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Write a brief story for this member..."
              className={inputCls + ' resize-none h-24'} style={inputStyle} />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[9px] tracking-[0.2em] text-emerald-500/50 uppercase font-bold px-1">SIGNATURE COLOR</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, node_color:c }))}
                  className="aspect-square rounded-lg border-2 transition-all hover:scale-110 active:scale-95"
                  style={{ background:c, borderColor: form.node_color===c ? 'white' : 'transparent', boxShadow: form.node_color===c ? `0 0 15px ${c}40` : 'none' }} />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-3 px-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
            <input type="checkbox" checked={form.is_admin}
              onChange={e => setForm(p => ({ ...p, is_admin: e.target.checked }))}
              className="w-4 h-4 rounded border-white/10 bg-black accent-emerald-500" />
            <span className="font-mono text-[10px] tracking-widest text-emerald-500/60 uppercase font-bold group-hover:text-emerald-400 transition-colors">Grant Admin Access</span>
          </label>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="font-mono text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              {error}
            </motion.div>
          )}

          <button onClick={save} disabled={saving}
            className="w-full py-4 font-bold text-sm tracking-[0.2em] uppercase transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            style={{ background:'#10b981', color:'#010f04', borderRadius:'14px', marginTop:'8px' }}>
            {saving ? 'SYNCHRONIZING…' : 'INITIALIZE DEPLOYMENT'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================
// EDIT PROFILE MODAL
// ============================================================

const EditProfileModal = ({ member, onClose, onUpdated }) => {
  const [form, setForm] = useState({ ...member });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/team/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_color: form.node_color, bio: form.bio, status: form.status, joined_at: form.joined_at }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || 'Failed to update dossier.'); setSaving(false); return; }
    onUpdated(data); onClose();
  };

  const uploadAvatar = async (fileOrEvent) => {
    let file;
    if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else {
      file = fileOrEvent?.target?.files?.[0];
    }
    if (!file) return;

    setUploading(true);
    setError('');

    // Client-side size check (20MB)
    if (file.size > 20971520) {
      setError('Avatar file size cannot exceed 20MB.');
      setUploading(false);
      return;
    }

    // Client-side mimetype check
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, and GIF images are allowed.');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/team/profile', { method: 'POST', body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Avatar upload failed.');
    } else {
      setForm(data);
      onUpdated(data);
    }
    setUploading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ background: 'rgba(2,13,5,0.95)' }}
    >
      <motion.div
        className="w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        style={{ background:'#020d05', border:'1px solid #0f5c1e', borderRadius:'24px' }}
        initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-emerald-500" />
            <span className="font-mono text-xs tracking-[0.3em] text-emerald-500 uppercase font-bold">Edit Profile</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        <div className="p-8">
          <ProfileEditor 
            member={member} 
            form={form} 
            setForm={setForm} 
            onUploadAvatar={uploadAvatar} 
            uploading={uploading} 
          />
          
          {error && (
            <div className="mt-6 font-mono text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}
          
          <div className="mt-8 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all font-mono tracking-wider">
              CANCEL
            </button>
            <button onClick={save} disabled={saving || uploading}
              className="flex-[2] py-4 bg-emerald-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] disabled:opacity-50 font-mono tracking-wider">
              {saving ? 'UPDATING DOSSIER…' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function FleetDirectoryPage({ pageData }) {
  const kicker = pageData?.kicker || 'Crew Network';
  const headingLine1 = pageData?.headingLine1 || 'Team';
  const headingLine2 = pageData?.headingLine2 || 'Scene';
  const description = pageData?.description || 'The roster wall, but not the boring kind. Pilots, officers, and crew — all here in clean cards with full style.';
  const accessCard = pageData?.accessCard || {};
  const briefing = pageData?.briefing || {};
  const joinCTA = pageData?.joinCTA || {};

  const [members, setMembers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [session, setSession]             = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fetchError, setFetchError]       = useState(null);
  const [authError, setAuthError]         = useState(null);

  const [currentUserMember, setCurrentUserMember] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'network'
  const [syncing, setSyncing] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Public API — returns only approved members
      const res = await fetch('/api/team-members', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setFetchError(data?.error || 'Failed to establish connection with the central database.');
        setMembers([]);
      } else {
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setFetchError('Network communication error. Check your connection to the grid.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();

    fetch('/api/auth/discord/session', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data?.authenticated) {
          setSession(data.user);
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
        console.error('Auth error:', err);
        setSession(null); 
        setCurrentUserMember(null); 
        setAuthError('Authentication service unreachable.');
      });
  }, [fetchMembers]);

  const loginWithDiscord = () => {
    window.location.href = '/api/auth/discord/login?returnTo=/team';
  };

  const logout = async () => {
    await fetch('/api/auth/discord/logout', { method: 'POST' });
    setSession(null);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/discord/sync', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        alert(`Successfully synced ${data.synced} members!`);
        fetchMembers();
      } else {
        alert(`Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Error during sync: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const isAdmin = currentUserMember?.is_admin || session?.source === 'env' || false;

  const availableRoles = useMemo(() => {
    const set = new Set(members.map(m => m.role).filter(Boolean));
    return Array.from(set).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    let f = [...members];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(m => m.name?.toLowerCase().includes(q) || m.discord_tag?.toLowerCase().includes(q) || m.bio?.toLowerCase().includes(q));
    }
    if (roleFilter) f = f.filter(m => m.role === roleFilter);
    if (categoryFilter) f = f.filter(m => m.category === categoryFilter);
    f.sort((a,b) => {
      const oa = FLAIR_ORDER[a.role] || 99, ob = FLAIR_ORDER[b.role] || 99;
      if (oa !== ob) return oa - ob;
      const ra = RANK_ORDER[a.category] || 99, rb = RANK_ORDER[b.category] || 99;
      if (ra !== rb) return ra - rb;
      return (a.name||'').localeCompare(b.name||'');
    });
    return f;
  }, [members, search, roleFilter, categoryFilter]);

  const onlineCount = members.filter(m => m.status === 'active').length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020402] text-white selection:bg-lime-300/30" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(163,230,53,0.12),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_25%,transparent_75%,rgba(0,0,0,0.7))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(163,230,53,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.08)_1px,transparent_1px)] [background-size:78px_78px]" />

      <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-5 2xl:px-8">
        {/* ── HEADER ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-end"
        >
          <div>
            <div className="font-mono text-sm font-black uppercase tracking-[0.4em] text-lime-300/55">{kicker}</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 sm:gap-x-5 leading-none tracking-[-0.09em]">
              <span className="text-[12vw] font-black uppercase text-transparent [-webkit-text-stroke:1px_rgba(217,249,157,0.28)] md:text-[5rem] lg:text-[6rem]">{headingLine1}</span>
              <span className="text-[12vw] font-black uppercase text-white md:text-[5rem] lg:text-[6rem]">{headingLine2}</span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-snug text-white/40">
              {description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-lime-100/40">
              <span>{members.length} personnel</span>
              <span className="h-1 w-1 rounded-full bg-lime-300/30" />
              <span className="text-lime-300/70">{onlineCount} active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-lime-300/10 bg-white/[0.035] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.34em] text-lime-300/50">{accessCard.kicker || "Crew Access"}</div>
                <div className="mt-1 text-xl font-black tracking-[-0.05em] text-white">{accessCard.heading || "Scene Live"}</div>
              </div>
              <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-lime-200">
                {accessCard.badge || "Live"}
              </div>
            </div>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-white/40">
              {accessCard.description || "Entry is through Discord, then you set up your profile. Admins get extra tools; otherwise, chill mode."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {session ? (
                <>
                  {currentUserMember && (
                    <button onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10 active:scale-95">
                      <User size={13} /> My Profile
                    </button>
                  )}
                   {isAdmin && (
                    <>
                      <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-xl bg-lime-300 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-lime-200 active:scale-95">
                        <Plus size={13} /> Add Member
                      </button>
                      <button onClick={handleSync} disabled={syncing}
                        className="flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-300 transition-all hover:bg-lime-300/25 active:scale-95 disabled:opacity-50">
                        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Members'}
                      </button>
                    </>
                  )}
                  <button onClick={logout}
                    className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-300 transition-all hover:bg-red-500/20 active:scale-95">
                    <LogOut size={13} /> Sign Out
                  </button>
                </>
              ) : (
                <button onClick={loginWithDiscord}
                  className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-[#4752C4] active:scale-95">
                  <LogIn size={14} /> Sign In with Discord
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <StatsBar members={members} />

        {/* Filters */}
        <div className="mt-6 mb-4 flex flex-col xl:flex-row xl:items-end gap-6 justify-between">
          <div className="flex-1 min-w-0">
            <FilterBar
              search={search} setSearch={setSearch}
              roleFilter={roleFilter} setRoleFilter={setRoleFilter}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              availableRoles={availableRoles}
            />
          </div>
          <div className="flex-shrink-0 flex items-center bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-[1.25rem] p-1 self-start xl:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                viewMode === 'grid'
                  ? 'bg-lime-300 text-[#020402] shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                  : 'text-lime-100/40 hover:text-white'
              }`}
            >
              Roster Wall
            </button>
            <button
              onClick={() => setViewMode('network')}
              className={`px-5 py-2.5 rounded-xl font-mono text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                viewMode === 'network'
                  ? 'bg-lime-300 text-[#020402] shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                  : 'text-lime-100/40 hover:text-white'
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
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs font-black uppercase tracking-[0.28em] text-amber-400">Pending Crew Approval</div>
              <p className="mt-1 text-sm text-white/55">
                You&apos;re in the system, {currentUserMember.name}. An admin will approve your slot shortly — then you&apos;ll appear on the public roster.
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
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Database Error</div>
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
                  <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Auth Error</div>
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
                <div className="absolute inset-2 border-2 border-emerald-500/30 rounded-xl animate-spin" style={{ animationDirection:'reverse', animationDuration:'0.8s' }} />
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
          ) : viewMode === 'network' ? (
            <RanksRolesChart />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredMembers.map(member => (
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
                <span>{filteredMembers.filter(m => m.status === 'active').length} Active</span>
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
        {showAddModal && (
          <AddMemberModal onClose={() => setShowAddModal(false)} onAdded={fetchMembers} />
        )}
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
