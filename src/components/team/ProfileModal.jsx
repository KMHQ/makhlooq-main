'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, Crown, Sword, Users, Zap, Terminal } from 'lucide-react';

const SEC_LEVELS = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6'];

const STATUS_META = {
  active:   { color: '#00ff41', label: 'ACTIVE',   dot: 'bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse' },
  inactive: { color: '#2a3a2a', label: 'INACTIVE', dot: 'bg-[#1a3020]' },
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

export default function ProfileModal({ member, isAdmin = false, onMemberUpdated, onClose }) {
  if (!member) return null;
  const { Icon: fallbackIcon, accent: fallbackAccent } = getRoleConfig(member.role);
  const accent = member.flair_color || fallbackAccent || '#10b981';
  const frameColor = member.node_color || accent;
  const Icon = member.flair_icon === 'none' ? null : (ICON_MAP[member.flair_icon?.toLowerCase()] || fallbackIcon);
  const initial = member.name?.[0]?.toUpperCase() || '?';

  const [currentStatus, setCurrentStatus] = useState(member.status || 'inactive');
  const [currentIsAdmin, setCurrentIsAdmin] = useState(Boolean(member.is_admin));
  const [updating, setUpdating] = useState(false);

  const status = STATUS_META[currentStatus] || STATUS_META.inactive;

  const handleToggleStatus = async () => {
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    setCurrentStatus(next);
    setUpdating(true);
    await fetch(`/api/team-members/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    onMemberUpdated?.();
  };

  const handleToggleAdmin = async () => {
    const next = !currentIsAdmin;
    setCurrentIsAdmin(next);
    setUpdating(true);
    await fetch(`/api/team-members/${member.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: next }),
    });
    setUpdating(false);
    onMemberUpdated?.();
  };

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
        className="relative w-full max-w-lg"
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
        <div className="flex items-center justify-between px-4 h-9 border-b rounded-t-[4px]" style={{ borderColor: `${frameColor}25`, background: `${frameColor}08` }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-sm animate-pulse" style={{ background: frameColor }} />
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: frameColor }}>
              CITIZEN_DOSSIER // ACCESS_GRANTED
            </span>
          </div>
          <button onClick={onClose} className="transition-colors p-1 cursor-pointer" style={{ color: frameColor }}>
            <X size={14} />
          </button>
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-30 rounded-[4px] overflow-hidden"
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
                  clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 14px,100% 100%,12px 100%,0 calc(100% - 12px))',
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
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-white tracking-tight leading-none truncate">
                  {member.name || 'UNKNOWN_SUBJECT'}
                </h2>
                {currentIsAdmin && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <Shield size={10} className="text-purple-400" /> ADMIN
                  </span>
                )}
              </div>
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

          {/* Admin Controls */}
          {isAdmin && (
            <div className="border-t pt-4 pb-2 mb-4" style={{ borderColor: `${frameColor}20` }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Shield size={12} className="text-emerald-400" />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-emerald-400 uppercase font-black">
                    ADMIN_OVERRIDE_CONTROLS //
                  </span>
                </div>
                {updating && (
                  <span className="font-mono text-[9px] text-lime-400 animate-pulse uppercase">SAVING…</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Active / Inactive Status Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentStatus === 'active'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStatus === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-gray-500'}`} />
                    {currentStatus === 'active' ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest opacity-60 ml-1">TOGGLE</span>
                </button>

                {/* Admin Power Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleAdmin}
                  disabled={updating}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentIsAdmin
                      ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                      : 'bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Shield size={12} className={currentIsAdmin ? 'text-purple-400 flex-shrink-0' : 'text-gray-500 flex-shrink-0'} />
                    {currentIsAdmin ? 'ADMIN: ON' : 'ADMIN: OFF'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest opacity-60 ml-1">TOGGLE</span>
                </button>
              </div>
            </div>
          )}

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
                    <div key={i} className="group/award relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all flex-shrink-0">
                      {imgUrl && (
                        <img src={imgUrl} alt={title} className="w-8 h-8 object-contain flex-shrink-0" />
                      )}
                      <div className="flex flex-col pr-1 min-w-0">
                        <span className="font-mono text-xs text-white font-bold leading-tight whitespace-nowrap">{award.category}</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-medium mt-0.5 tracking-wider uppercase whitespace-nowrap">{award.tier}</span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-0 mb-2 w-72 md:w-80 hidden group-hover/award:block bg-[#020d05] border border-emerald-500/40 p-4 rounded-xl shadow-2xl text-left z-[100] pointer-events-none">
                        <div className="font-bold text-xs text-white uppercase tracking-wider">{award.category} ({award.tier})</div>
                        {details && (
                          <div className="text-xs text-gray-200 mt-1.5 leading-relaxed font-sans font-normal">{details.desc}</div>
                        )}
                        {details && details.requirement[award.tier] && (
                          <div className="text-[10px] text-emerald-400 font-mono font-bold mt-2 pt-1.5 border-t border-white/10">Requirement: {details.requirement[award.tier]}</div>
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
}
