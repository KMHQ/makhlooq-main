'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function FleetShipDetails({ ship, stackedCeos = [] }) {
  if (!ship) return (
    <div className="w-full h-full rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl flex items-center justify-center">
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">Select a ship to see details</div>
    </div>
  );

  const stats = [
    { label: 'Length', val: ship.length || 'N/A' },
    { label: 'Crew',   val: ship.crew   || 'N/A' },
    { label: 'Cargo',  val: ship.cargo  || 'N/A' },
    { label: 'Speed',  val: ship.topSpeed || 'N/A' },
  ];

  const validCeos = (stackedCeos || []).filter(c => c && c.trim() !== '');
  const owner = ship.ceoName && ship.ceoName.trim() !== '' ? ship.ceoName.trim() : null;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={ship.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full h-full rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] overflow-hidden flex gap-0"
      >
        {/* Subtle top-edge glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />

        {/* LEFT: Identity */}
        <div className="flex flex-col justify-center px-5 py-3 flex-1 min-w-0 border-r border-white/[0.06]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-lime-400/70 leading-none mb-0 pb-0">
            {ship.manufacturer}
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-black uppercase tracking-tight text-white leading-tight truncate mt-0.5 mb-2.5">
            {ship.name}
          </h2>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 leading-none mb-2">
            {ship.role || ship.class}
          </div>

          {/* Owner badge(s) */}
          {/* Owner badge(s) */}
          {validCeos.length > 1 ? (
            <div className="space-y-1.5">
              <div className="text-[8px] font-mono font-black uppercase tracking-[0.3em] text-lime-400/40">Fleet COs</div>
              <div className="flex flex-wrap gap-1.5 max-h-[44px] overflow-y-auto pr-2 custom-scrollbar">
                {validCeos.map((ceo, i) => (
                  <div key={i} className="inline-flex items-center gap-1 rounded-full border border-lime-400/25 bg-lime-400/10 px-2 py-0.5" title={`CO: ${ceo}`}>
                    <span className="text-[7px] font-mono font-black uppercase tracking-widest text-lime-400/60">CO</span>
                    <span className="w-px h-2.5 bg-lime-400/20" />
                    <svg className="w-2 h-2 text-lime-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest text-lime-300 truncate max-w-[80px]">
                      {ceo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : owner ? (
            <div className="inline-flex items-center gap-0 self-start rounded-full border border-lime-400/25 bg-lime-400/10 overflow-hidden">
              {/* CO label pill */}
              <span className="px-2 py-1 text-[8px] font-mono font-black uppercase tracking-[0.2em] text-black bg-lime-400/80 leading-none">
                CO
              </span>
              {/* Name */}
              <div className="flex items-center gap-1.5 px-3 py-1">
                <svg className="w-2.5 h-2.5 text-lime-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-lime-300 truncate max-w-[130px]">
                  {owner}
                </span>
              </div>
            </div>
          ) : null}

          {/* Description */}
          <p className="mt-2.5 text-sm md:text-base leading-relaxed text-white/80 line-clamp-4 pr-2 block">
            {ship.description}
          </p>
        </div>

        {/* RIGHT: Stats grid */}
        <div className="grid grid-cols-2 shrink-0 w-[220px]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col justify-center px-4 py-3
                ${i % 2 === 0 ? 'border-r border-white/[0.06]' : ''}
                ${i < 2 ? 'border-b border-white/[0.06]' : ''}
              `}
            >
              <div className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-lime-400/70 mb-1">
                {s.label}
              </div>
              <div className="text-sm font-sans font-black text-white truncate leading-normal py-0.5">
                {s.val}
              </div>
            </div>
          ))}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
