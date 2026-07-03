'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Loader2, X } from 'lucide-react';

import Header from '../../../src/components/Header';
import FleetScene from '../../../src/components/fleet/FleetScene';
import FleetShipDetails from '../../../src/components/fleet/FleetShipDetails';

const getShipType = (model = {}) => {
  const c = (model.classification || model.classificationLabel || '').toLowerCase();
  if (c.includes('capital') || c.includes('battleship') || c.includes('carrier') || c.includes('corvette')) return 'capital';
  if (c.includes('fighter') || c.includes('interceptor') || c.includes('gunship')) return 'fighter';
  if (c.includes('explorer') || c.includes('scout')) return 'explorer';
  if (c.includes('freighter') || c.includes('industrial') || c.includes('hauler') || c.includes('transport')) return 'industrial';
  if (c.includes('luxury') || c.includes('yacht')) return 'luxury';
  return 'medium';
};

const getAccentColor = (classification = '') => {
  const n = classification.toLowerCase();
  if (n.includes('fighter') || n.includes('interceptor')) return '#a3e635';
  if (n.includes('explore') || n.includes('scout')) return '#22c55e';
  if (n.includes('industrial') || n.includes('freighter') || n.includes('transport')) return '#65a30d';
  if (n.includes('luxury') || n.includes('yacht')) return '#84cc16';
  if (n.includes('capital') || n.includes('command') || n.includes('corvette')) return '#d9f99d';
  return '#4ade80';
};

const mapVehicleToShip = (vehicle) => {
  const model = vehicle.model || vehicle || {};
  const media = model.media || {};
  const metrics = model.metrics || {};
  const name = vehicle.name || model.name || 'Unknown Vessel';
  const classification = model.classificationLabel || model.classification || 'Unknown';

  const normalizeAssetUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/(\.(?:gltf|glb))\/?$/i, '$1').trim();
  };

  return {
    id: vehicle.id || vehicle.slug || `${name}-${vehicle.serial || 'unknown'}`,
    slug: model.slug || vehicle.modelSlug || vehicle.model_slug || vehicle.slug || '',
    name,
    manufacturer: model.manufacturer?.name || 'Unknown Manufacturer',
    class: classification,
    role: model.focus || classification,
    crew: model.crew?.maxLabel || (model.crew?.max ? String(model.crew.max) : 'N/A'),
    length: metrics.lengthLabel || (metrics.length ? `${metrics.length}m` : 'N/A'),
    mass: metrics.massLabel || (metrics.mass ? `${metrics.mass} kg` : 'N/A'),
    cargo: metrics.cargoLabel || (metrics.cargo ? `${metrics.cargo} SCU` : 'N/A'),
    topSpeed: model.speeds?.maxSpeed ? `${model.speeds.maxSpeed} m/s` : 'N/A',
    price: model.price,
    pledgePrice: model.pledgePrice,
    priceLabel: model.priceLabel,
    pledgePriceLabel: model.pledgePriceLabel,
    description: model.description || 'No description available.',
    modelPath: normalizeAssetUrl(media.holo?.url || ''),
    holoUrl: normalizeAssetUrl(media.holo?.url || ''),
    thumbnail:
      media.storeImage?.mediumUrl ||
      media.storeImage?.url ||
      media.angledViewColored?.mediumUrl ||
      media.angledView?.mediumUrl ||
      media.frontViewColored?.mediumUrl ||
      media.frontView?.mediumUrl ||
      media.fleetchartImage ||
      '',
    meshType: getShipType(model),
    accentColor: getAccentColor(classification),
    weapons: vehicle.activeLoadout ? 'Configured Loadout' : 'Standard Loadout',
    features: [
      model.productionStatus || 'Production status unknown',
      model.hasPaints ? 'Custom Paint Available' : null,
    ].filter(Boolean),
    specs: {
      shields: { label: 'Shield Status', value: model.hasModules ? 'Equipped' : 'Unknown', pct: model.hasModules ? 72 : 18 },
      armor: { label: 'Armor Status', value: model.hasPaints ? 'Painted' : 'Unpainted', pct: model.hasPaints ? 60 : 35 },
      firepower: { label: 'Weapons', value: vehicle.activeLoadout ? 'Configured' : 'Unknown', pct: vehicle.activeLoadout ? 55 : 20 },
      speed: { label: 'Top Speed', value: model.speeds?.maxSpeed ? `${model.speeds.maxSpeed} m/s` : 'N/A', pct: model.speeds?.maxSpeed ? Math.min(100, model.speeds.maxSpeed / 6) : 10 },
      stealth: { label: 'Stealth', value: 'Standard', pct: 35 },
    },
  };
};

const getModelSlug = (item = {}) => {
  const model = item.model && typeof item.model === 'object' ? item.model : item;
  return (
    model?.slug ||
    item?.slug ||
    item?.model_slug ||
    item?.modelSlug ||
    ''
  );
};

const getModelName = (item = {}) => {
  const model = item.model && typeof item.model === 'object' ? item.model : item;
  return model?.name || item?.name || 'Unknown Vessel';
};

// No dedup — each fleet config entry is its own ship (even if same slug).
// Unique IDs are assigned per config in fetchData below.

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

const getShipPrice = (ship) => {
  const raw = ship?.pledgePrice ?? ship?.price ?? ship?.pledgePriceLabel ?? ship?.priceLabel ?? 0;
  const number = Number(String(raw).replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) ? number : 0;
};

const getShipValue = (ship) => getShipPrice(ship.model || ship);

const getStackKey = (ship = {}, index = 0) => (
  ship.slug ||
  ship.modelSlug ||
  ship.id ||
  `${ship.name || 'ship'}-${index}`
);

function StackGhosts({ count = 1, compact = false }) {
  const layers = Math.min(Math.max(Number(count) || 0, 0), compact ? 3 : 4);
  if (layers <= 1) return null;

  return (
    <>
      {Array.from({ length: layers - 1 }).map((_, index) => {
        const offset = index + 1;
        return (
          <span
            key={offset}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-xl border border-lime-300/15 bg-black/70 transition-all duration-300 ${compact
              ? 'translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2'
              : 'translate-x-1.5 translate-y-1.5 group-hover:translate-x-3 group-hover:translate-y-2'
              }`}
            style={{
              zIndex: -offset,
              opacity: 0.7 - index * 0.16,
              transform: compact
                ? `translate(${offset * 3}px, ${offset * 3}px) rotate(${offset * 1.4}deg)`
                : `translate(${offset * 5}px, ${offset * 4}px) rotate(${offset * 1.8}deg)`,
            }}
          />
        );
      })}
    </>
  );
}

function MiniBlocks({ count = 0, color = '#9AD84A', max = 40 }) {
  const blocks = Array.from({ length: Math.max(0, Math.min(max, Number(count) || 0)) });

  return (
    <div className="flex max-w-[92px] flex-wrap gap-[3px]">
      {blocks.map((_, index) => (
        <span key={index} className="h-2 w-2 rounded-[1px]" style={{ background: color }} />
      ))}
    </div>
  );
}

function DonutChart({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cursor = 0;
  const gradientStops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + (segment.value / total) * 360;
    cursor = end;
    return `${segment.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]"
        style={{ background: `conic-gradient(${gradientStops}, rgba(255,255,255,0.04) ${cursor}deg 360deg)` }}
      />
      <div className="absolute inset-[34px] rounded-full bg-[#202020] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" />
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_49.5%,rgba(255,255,255,0.07)_50%,transparent_50.5%),linear-gradient(30deg,transparent_49.5%,rgba(255,255,255,0.05)_50%,transparent_50.5%),linear-gradient(150deg,transparent_49.5%,rgba(255,255,255,0.05)_50%,transparent_50.5%)]" />
      <div className="relative text-center">
        <div className="text-3xl font-semibold text-white">{formatNumber(total)}</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Fleet Size</div>
      </div>
    </div>
  );
}

function FleetValueChart({ ships, totalValue }) {
  const shipValues = ships
    .map(getShipValue)
    .filter((value) => value > 0)
    .sort((a, b) => b - a);
  const cumulativeValues = shipValues.reduce((values, value) => {
    values.push((values.at(-1) || 0) + value);
    return values;
  }, []);
  const rawValues = cumulativeValues.length > 1 ? cumulativeValues : [0, totalValue || 0];
  const maximum = Math.max(...rawValues, 1);
  const values = rawValues.map((value) => value / maximum);
  const width = 360;
  const height = 210;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - value * height;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height} ${points} ${width},${height}`;
  const markerIndex = Math.max(0, Math.floor((values.length - 1) * 0.6));
  const markerX = values.length > 1 ? (markerIndex / (values.length - 1)) * 100 : 0;
  const markerY = 100 - values[markerIndex] * 100;
  const tooltipValue = rawValues[markerIndex] || totalValue;

  return (
    <div className="relative h-[250px] overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-x-0 bottom-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fleet-value-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>
        {values.map((_, index) => (
          <line
            key={index}
            x1={(index / (values.length - 1)) * width}
            x2={(index / (values.length - 1)) * width}
            y1="0"
            y2={height}
            stroke="rgba(255,255,255,0.10)"
            strokeDasharray="4 4"
          />
        ))}
        <polygon points={area} fill="url(#fleet-value-fill)" />
        <polyline points={points} fill="none" stroke="#ffffff" strokeWidth="2" />
      </svg>
      <div
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-white/60 shadow-[0_0_20px_rgba(255,255,255,0.7)]"
        style={{ left: `${markerX}%`, top: `${markerY}%` }}
      />
      <div className="absolute right-3 top-5 rounded-md bg-[#9AD84A] px-3 py-2 text-[9px] font-semibold text-[#1b1b1b] shadow-xl">
        <div>{formatNumber(markerIndex + 1)} ships loaded</div>
        <div className="mt-1">Cumulative value:</div>
        <div>{formatCurrency(tooltipValue)}</div>
      </div>
    </div>
  );
}

function FleetDashboard({ ships, selectedShip, totalShips, totalMembers, totalMaxCrew, totalValue, segments }) {
  const crew = Number(totalMaxCrew) || 0;
  const members = Number(totalMembers) || 0;
  const topSegments = segments.slice(0, 3);
  const segmentTotal = topSegments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <section className="fleet-dashboard-grid">
      <div className="fleet-dashboard-card overflow-hidden">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-white">Fleet stats</h2>
          <div className="relative mt-4 h-44 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="absolute inset-x-8 bottom-0 h-16 rounded-full bg-white/10 blur-2xl" />
            {selectedShip?.thumbnail ? (
              <img
                src={selectedShip.thumbnail}
                alt={selectedShip?.name || 'Selected fleet ship'}
                className="relative z-10 h-full w-full object-cover drop-shadow-[0_25px_25px_rgba(0,0,0,0.45)]"
              />
            ) : (
              <div className="relative z-10 flex h-full w-full items-center justify-center text-center text-xs uppercase tracking-[0.3em] text-white/35">
                No public image
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/10">
          {[
            { label: 'Fleet value', value: formatCurrency(totalValue) },
            { label: 'Crew cap', value: formatNumber(crew) },
            { label: 'Fleets', value: formatNumber(members) },
          ].map((item, index) => (
            <div key={item.label} className={`p-4 ${index > 0 ? 'border-l border-white/10' : ''}`}>
              <div className="text-[10px] text-white/60">{item.label}</div>
              <div className="mt-3 text-2xl font-medium tracking-tight text-white">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-b-[18px] border-t border-white/10 bg-[#111111] p-5 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Status Overview</h3>
            <button className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/45">Live</button>
          </div>
          <div className="flex h-5 overflow-hidden rounded-md bg-white/5">
            {topSegments.map((segment) => (
              <div
                key={segment.label}
                style={{
                  background: segment.color,
                  width: `${(segment.value / segmentTotal) * 100}%`,
                }}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-[10px] text-white/45">
            {topSegments.map((segment) => (
              <span key={segment.label} className="inline-flex items-center gap-2">
                <i className="h-2 w-2 rounded-sm" style={{ background: segment.color }} />
                {segment.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="fleet-dashboard-card overflow-hidden">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-white">Fleet Size</h2>
          <DonutChart segments={segments} />
        </div>
        <div className="rounded-b-[18px] border-t border-white/10 bg-[#111111] p-5 text-white">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {topSegments.map((segment) => (
              <div key={segment.label} className="flex items-start gap-3">
                <MiniBlocks count={segment.value} color={segment.color} />
                <div>
                  <div className="text-sm font-semibold">{formatNumber(segment.value)}</div>
                  <div className="text-[10px] text-white/45">{segment.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fleet-dashboard-card p-5">
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-semibold text-white">Fleet Valuation</h2>
          <button className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/70">
            <CalendarDays size={14} />
          </button>
        </div>
        <div className="mt-5 text-4xl font-light tracking-tight text-white">
          {formatCurrency(totalValue)}
        </div>
        <div className="mt-3 text-xs text-white/55">
          Based on current public ship prices
        </div>
        <FleetValueChart ships={ships} totalValue={totalValue} />
      </div>
    </section>
  );
}

function FleetCommandBriefing({ ships, selectedShip, totalValue, totalMaxCrew }) {
  const rows = [
    {
      label: 'Hangar',
      metric: ships.length,
      title: 'Full Fleet Lineup',
      body: 'All KMHQ heavy metal is lined up here with style. Click on any ship you like to switch the scene.',
    },
    {
      label: 'Vibe',
      metric: selectedShip?.holoUrl ? '3D Ready' : 'Chill View',
      title: 'Showroom mood',
      body: 'Sometimes a full 3D flex, sometimes a clean cinematic card. Either way, the ship scene stays tight.',
    },
    {
      label: 'Pick',
      metric: selectedShip?.name || 'Standby',
      title: 'Choose your ride',
      body: selectedShip?.name
        ? `${selectedShip.name} is now in the spotlight. Click another ride to give it the stage.`
        : 'Select a ship and the hangar focus will instantly shift to it.',
    },
  ];

  return (
    <section className="relative mt-8 overflow-hidden rounded-[2.5rem] border border-lime-300/10 bg-white/[0.025] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(163,230,53,0.14),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(34,197,94,0.10),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.04),transparent_48%)]" />
      <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-mono text-sm font-black uppercase tracking-[0.36em] text-lime-300/60">Hangar Mood</p>
          <h2 className="mt-5 text-[18vw] font-black uppercase leading-[0.78] tracking-[-0.1em] text-transparent [-webkit-text-stroke:1px_rgba(217,249,157,0.28)] md:text-[9rem] lg:text-[10rem]">
            Big
            <span className="block text-white [-webkit-text-stroke:0]">Toys</span>
          </h2>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-white/52">
            A little flex, a little command, a little cinematic showroom. The KMHQ fleet scene is simple: pick a ship, enjoy the view.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-lime-300/10 bg-black/35 p-5">
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-lime-300/45">Value</div>
              <div className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">{formatCurrency(totalValue)}</div>
            </div>
            <div className="rounded-3xl border border-lime-300/10 bg-black/35 p-5">
              <div className="font-mono text-xs uppercase tracking-[0.28em] text-lime-300/45">Crew Cap</div>
              <div className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">{formatNumber(totalMaxCrew)}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {rows.map((item, index) => (
            <motion.div
              key={item.label}
              className="group overflow-hidden rounded-[1.6rem] border border-lime-300/10 bg-black/35 p-5 text-left transition-colors hover:border-lime-300/35 hover:bg-lime-300/[0.04]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ x: 6 }}
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="font-mono text-xs font-black uppercase tracking-[0.3em] text-lime-300/45">{item.label}</div>
                  <div className="mt-3 text-2xl font-black tracking-[-0.05em] text-white md:text-3xl">{item.title}</div>
                </div>
                <div className="max-w-[180px] truncate rounded-2xl border border-lime-300/15 bg-lime-300/10 px-4 py-3 text-right font-mono text-sm font-black uppercase tracking-[0.16em] text-lime-200">
                  {item.metric}
                </div>
              </div>
              <p className="mt-5 text-lg leading-relaxed text-white/52">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useLivePreview } from '@payloadcms/live-preview-react';

export default function FleetPageClient({ data: initialData }) {
  const { data } = useLivePreview({
    initialData,
    serverURL: (typeof window !== 'undefined' && window.__SERVER_URL__) || process.env.NEXT_PUBLIC_SERVER_URL || 'https://kmhq.org',
    depth: 2,
  });

  const kicker = data?.kicker || 'KMHQ · Capital Assets';
  const headingLine1 = data?.headingLine1 || 'Fleet';
  const headingLine2 = data?.headingLine2 || 'Command';
  const badgeText = data?.badgeText || 'Live';
  const shipsReadyLabel = data?.shipsReadyLabel || 'Ships Ready';
  const totalValueLabel = data?.totalValueLabel || 'Total Flex';
  const crewSeatsLabel = data?.crewSeatsLabel || 'Crew Seats';
  const standardKicker = data?.standardKicker || 'Admin Managed';
  const standardHeading = data?.standardHeading || 'Standard Fleets';
  const searchPlaceholder = data?.searchPlaceholder || 'Search fleets...';

  const [ships, setShips] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedShipDetails, setSelectedShipDetails] = useState(null);
  const [loadingSelectedShip, setLoadingSelectedShip] = useState(false);
  const [loadingShips, setLoadingShips] = useState(false);
  const [apiError, setApiError] = useState('');
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [capitalPage, setCapitalPage] = useState(0);
  const carouselRef = useRef(null);
  const lastScrollTime = useRef(0);


  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoadingShips(true);
      setApiError('');

      try {
        const configsRes = await fetch('/api/fleet-configs');
        const configsData = await configsRes.json();
        if (!configsRes.ok) throw new Error(configsData?.error || `Fleet config error (${configsRes.status})`);

        const configs = Array.isArray(configsData) ? configsData : [];
        const activeConfigs = configs.filter(cfg => cfg.enabled !== false);
        const sourceConfigs = activeConfigs.length > 0 ? activeConfigs : configs;

        if (sourceConfigs.length === 0) {
          if (!cancelled) {
            setShips([]);
          }
          return;
        }

        const fleetResults = await Promise.all(
          sourceConfigs.map(async (cfg, cfgIndex) => {
            // 1) First attempt to fetch as a specific ship MODEL
            const modelRes = await fetch(`/api/fleetyards/models?slugs=${encodeURIComponent(cfg.slug)}&fresh=1`, { cache: 'no-store' });
            const modelData = await modelRes.json().catch(() => ({}));
            const model = Array.isArray(modelData?.items) ? modelData.items.find(item => item && !item.error) : null;

            if (modelRes.ok && model) {
              // Assign a unique ID per config entry so same-slug ships are not deduped
              const uniqueId = cfg.id ? `cfg-${cfg.id}` : `cfg-${cfgIndex}-${cfg.slug}`;
              return [{ ...model, id: uniqueId, __fleetSlug: cfg.slug, __fleetName: cfg.display_name || model.name || cfg.slug, __fleetType: cfg.fleet_type, __ceoName: cfg.ceo_name, __fleetQuantity: cfg.quantity || 1, __sourceType: 'model' }];
            }

            // 2) If it wasn't a valid model, fallback to treating it as a FLEET
            const fleetRes = await fetch(`/api/fleetyards/vehicles?slug=${encodeURIComponent(cfg.slug)}&all=1&perPage=50`);
            const fleetData = await fleetRes.json().catch(() => ({}));

            if (fleetRes.ok && !fleetData?.error) {
              const items = Array.isArray(fleetData?.items) ? fleetData.items : [];
              return items.map((item, itemIdx) => ({
                ...item,
                id: item.id ? `${item.id}-cfg${cfg.id || cfgIndex}` : `cfg-${cfgIndex}-item${itemIdx}`,
                __fleetSlug: cfg.slug,
                __fleetName: cfg.display_name || cfg.slug,
                __fleetType: cfg.fleet_type,
                __ceoName: cfg.ceo_name,
                __fleetQuantity: cfg.quantity || 1,
                __sourceType: 'fleet',
              }));
            }

            console.warn(`FleetYards slug "${cfg.slug}" failed as model and fleet`, {
              model: modelData?.error || modelData?.items?.[0]?.error,
              fleet: fleetData?.error,
            });
            return [];
          })
        );

        // No global dedup — each config entry is intentionally its own ship card.
        const combinedItems = fleetResults.flat();
        const enrichedShips = combinedItems.map((item) => {
          const ship = mapVehicleToShip(item);
          return {
            ...ship,
            id: item.id || ship.id,
            name: item.__fleetName || ship.name,
            sourceFleet: item.__fleetName || '',
            fleetSlug: item.__fleetSlug || ship.slug || '',
            fleetType: item.__fleetType || 'small',
            ceoName: item.__ceoName || '',
            fleetQuantity: item.__fleetQuantity || 1,
          };
        });

        if (!cancelled) {
          setShips(enrichedShips);
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(err?.message || 'Failed to fetch public ship data from FleetYards.');
          setShips([]);
        }
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
    setSelectedIndex(i => (i - 1 + ships.length) % ships.length);
  }, [ships.length]);

  const goNext = useCallback(() => {
    if (ships.length === 0) return;
    setSelectedIndex(i => (i + 1) % ships.length);
  }, [ships.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    if (ships.length > 0 && selectedIndex >= ships.length) setSelectedIndex(0);
  }, [ships.length, selectedIndex]);

  const selectedShip = ships[selectedIndex] || null;
  const activeShip = selectedShipDetails || selectedShip;

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
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `FleetYards model error (${res.status})`);

        const model = Array.isArray(data?.items) ? data.items.find(item => !item?.error) : null;
        if (!model || cancelled) return;

        setSelectedShipDetails({
          ...selectedShip,
          ...mapVehicleToShip(model),
          id: selectedShip.id,
          name: selectedShip.sourceFleet || selectedShip.name, // Keep admin custom name
          fleetSlug: selectedShip.fleetSlug,
          sourceFleet: selectedShip.sourceFleet,
          ceoName: selectedShip.ceoName,
          fleetType: selectedShip.fleetType,
          fleetQuantity: selectedShip.fleetQuantity,
        });
      } catch (err) {
        if (!cancelled) {
          console.warn('Selected FleetYards model refresh failed:', err);
        }
      } finally {
        if (!cancelled) setLoadingSelectedShip(false);
      }
    };

    fetchSelectedShip();

    return () => {
      cancelled = true;
    };
  }, [selectedShip]);

  const totalMembers = new Set(ships.map(ship => ship.fleetSlug).filter(Boolean)).size;
  const totalValue = ships.reduce((sum, ship) => sum + getShipValue(ship), 0);
  const classificationSegments = [
    { label: 'Combat', value: ships.filter(ship => /fighter|interceptor|gunship|combat|capital corvette/i.test(`${ship.class} ${ship.role}`)).length, color: '#a3e635' },
    { label: 'Industry', value: ships.filter(ship => /industrial|freighter|transport|hauler|salvage/i.test(`${ship.class} ${ship.role}`)).length, color: '#16a34a' },
    { label: 'Exploration', value: ships.filter(ship => /explorer|scout|exploration/i.test(`${ship.class} ${ship.role}`)).length, color: '#4ade80' },
    { label: 'Other', value: ships.filter(ship => !/fighter|interceptor|gunship|combat|capital corvette|industrial|freighter|transport|hauler|salvage|explorer|scout|exploration/i.test(`${ship.class} ${ship.role}`)).length, color: '#365314' },
  ].filter(item => item.value > 0);
  const activeFleetName = 'Khalai Makhlooq Fleet';

  // Each config entry is its own card — group only by unique ship ID (not slug),
  // so two Polaris configs show as two separate cards.
  // Slug grouping is kept only for crew/value totals and the details panel lookup.
  const slugGroups = {};
  let computedTotalShips = 0;
  let computedTotalMaxCrew = 0;

  ships.forEach((ship, idx) => {
    // For slug lookup (details panel), still track by slug
    if (!slugGroups[ship.slug]) {
      slugGroups[ship.slug] = { stackedCeos: [] };
    }
    const qty = ship.fleetQuantity || 1;
    computedTotalShips += qty;
    const crewMax = Number(String(ship.crew || '').split('-').pop()?.replace(/[^0-9]/g, ''));
    computedTotalMaxCrew += (Number.isFinite(crewMax) ? crewMax : 0) * qty;
    const ceo = ship.ceoName && ship.ceoName.trim() !== '' ? ship.ceoName.trim() : null;
    if (ceo && !slugGroups[ship.slug].stackedCeos.includes(ceo)) {
      slugGroups[ship.slug].stackedCeos.push(ceo);
    }
  });

  // Each ship entry is now its own card with count = its fleetQuantity
  const stackedShips = ships.map((ship, idx) => ({
    ...ship,
    count: ship.fleetQuantity || 1,
    originalIndex: idx,
    instances: [{ ceo: ship.ceoName || null, qty: ship.fleetQuantity || 1, originalIndex: idx, id: ship.id }],
  }));
  const totalShips = computedTotalShips;
  const totalMaxCrew = computedTotalMaxCrew;

  const capitalFleets = stackedShips.filter(s => ['sub_capital', 'capital'].includes(s.fleetType));
  const standardFleets = stackedShips.filter(s => !['sub_capital', 'capital'].includes(s.fleetType));


  const getCapitalTag = (idx) => `F${idx + 1}`;
  const getSfTag = (idx) => `SF${idx + 1}`;

  return (
    <div className="fleet-page h-[100dvh] w-full overflow-hidden flex flex-col bg-[#020402] relative text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(101,163,13,0.18),transparent)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(163,230,53,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* Header is position:fixed in CSS — it overlays automatically, no need to render in flow */}
      <Header siteSettings={data?.siteSettings} />

      {/* Main layout — fills entire screen, pt accounts for the fixed header (~64px) */}
      <div className="relative z-10 w-full h-full px-4 pb-4 pt-[72px] overflow-hidden">

        {loadingShips && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-[2.5rem]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
              <div className="text-xs font-mono font-black uppercase tracking-[0.3em] text-lime-400/70">Accessing Fleet Manifest...</div>
            </div>
          </div>
        )}

        {/* Layout with 40% fleets column and 60% 3D column */}
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-3">

          {/* ═══════════════════════ LEFT COLUMN ═══════════════════════ */}
          <div className="flex flex-col gap-3 h-full overflow-hidden">

            {/* ── Panel A: Fleet Command ── */}
            <div className="relative flex flex-col rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] shrink-0 overflow-hidden">
              {/* Gradient accent */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(132,204,22,0.12),transparent)]" />

              <div className="relative p-5">
                {/* Title */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-lime-400/50 mb-1">{kicker}</div>
                    <h1 className="text-3xl xl:text-4xl font-black uppercase tracking-tight text-white leading-none">
                      {headingLine1} <span className="text-lime-400">{headingLine2}</span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-lime-300">{badgeText}</span>
                  </div>
                </div>

                {/* Capital Fleets — Horizontal Scroll-Snap Carousel */}
                {(() => {
                  const CARDS_PER_SLIDE = 4;
                  const totalPages = Math.max(1, Math.ceil(capitalFleets.length / CARDS_PER_SLIDE));

                  const handleScroll = (e) => {
                    const container = e.currentTarget;
                    const page = Math.round(container.scrollLeft / container.clientWidth);
                    setCapitalPage(page);
                  };

                  const scrollToPage = (pageIdx) => {
                    const container = carouselRef.current;
                    if (container) {
                      container.scrollTo({
                        left: pageIdx * container.clientWidth,
                        behavior: 'smooth'
                      });
                      setCapitalPage(pageIdx);
                    }
                  };

                  const handleWheel = (e) => {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                      const now = Date.now();
                      if (now - lastScrollTime.current > 400) { // 400ms cooldown for page flipping
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
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 scroll-smooth w-full"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {Array.from({ length: totalPages }).map((_, pageIdx) => {
                          const slideShips = capitalFleets.slice(pageIdx * CARDS_PER_SLIDE, (pageIdx + 1) * CARDS_PER_SLIDE);
                          const globalOffset = pageIdx * CARDS_PER_SLIDE;

                          return (
                            <div key={pageIdx} className="w-full shrink-0 snap-start snap-always grid grid-cols-2 gap-2.5">
                              {slideShips.map((ship, i) => {
                                const globalIdx = globalOffset + i;
                                const isExpanded = expandedSlug === ship.id;
                                return (
                                  <div key={ship.id} className="relative aspect-[16/8]">
                                    <button
                                      onClick={() => {
                                        if (ship.count > 1) {
                                          setExpandedSlug(isExpanded ? null : ship.id);
                                        } else {
                                          setSelectedIndex(ship.originalIndex);
                                        }
                                      }}
                                      className={`group absolute inset-0 w-full h-full rounded-xl transition-all duration-300
                                      ${activeShip?.id === ship.id
                                          ? 'border-2 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)] z-10'
                                          : 'border border-white/10 hover:border-lime-400/40 z-0'
                                        }`}
                                    >
                                      {/* Stacking effect */}
                                      {ship.count > 1 && !isExpanded && (
                                        <>
                                          <div className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl translate-x-1.5 translate-y-1.5 -z-10" />
                                          <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-xl translate-x-3 translate-y-3 -z-20" />
                                        </>
                                      )}

                                      {/* Main Card */}
                                      <div className={`absolute inset-0 rounded-xl overflow-hidden bg-black transition-all ${isExpanded ? 'opacity-20' : ''}`}>
                                        {ship.thumbnail
                                          ? <img src={ship.thumbnail} alt={ship.name} className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 saturate-125 contrast-105 scale-100 group-hover:scale-105" />
                                          : <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/10 text-white/20"><div className="w-12 h-12 border border-white/10 rounded-full" /></div>
                                        }

                                        {/* Top Badge & Count */}
                                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                                          <div className="bg-lime-400 text-black px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest">{getCapitalTag(globalIdx)}</div>
                                          {ship.count > 1 && (
                                            <div className="bg-black/60 backdrop-blur border border-white/10 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">×{ship.count}</div>
                                          )}
                                        </div>

                                        {/* Bottom Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black via-black/90 to-transparent z-10 text-left">
                                           <div className="text-[9px] font-mono font-bold text-lime-400/70 uppercase truncate leading-none mb-0">{ship.manufacturer}</div>
                                           <div className="text-[13px] font-mono font-black text-white uppercase tracking-tight truncate leading-tight mt-0.5 mb-1.5">{ship.name}</div>
                                           {ship.ceoName && (
                                             <div className="flex items-center gap-1.5">
                                               <span className="text-[7px] font-mono font-black uppercase tracking-widest text-lime-400/90 bg-lime-400/15 border border-lime-400/30 rounded px-1.5 py-0.5 leading-none">CO</span>
                                               <span className="text-[9px] font-mono text-white/60 uppercase truncate leading-none">{ship.count > 1 ? 'MULTIPLE' : ship.ceoName}</span>
                                             </div>
                                           )}
                                         </div>
                                      </div>
                                    </button>

                                    {/* Expanded View */}
                                    {isExpanded && (
                                      <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md rounded-xl border border-lime-400/30 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center mb-1 sticky top-0 bg-black/90 pb-1 z-10">
                                          <span className="text-[9px] font-black uppercase text-lime-400 tracking-widest px-1">Select Asset</span>
                                          <button onClick={(e) => { e.stopPropagation(); setExpandedSlug(null); }} className="text-white/50 hover:text-white"><X size={12} /></button>
                                        </div>
                                        {ship.instances?.map((inst, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => { setSelectedIndex(inst.originalIndex); setExpandedSlug(null); }}
                                            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-lime-400/20 border border-white/10 hover:border-lime-400/40 text-left transition-all"
                                          >
                                            <div className="min-w-0 pr-2">
                                              {inst.ceo && <div className="text-[10px] font-black text-white uppercase truncate">{inst.ceo}</div>}
                                              <div className="text-[8px] text-lime-400/60 font-mono tracking-widest">Qty: {inst.qty}</div>
                                            </div>
                                            <div className="shrink-0 w-4 h-4 rounded-full border border-lime-400/30 flex items-center justify-center">
                                              {activeShip?.id === inst.id && <div className="w-2 h-2 rounded-full bg-lime-400" />}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Fill slide with empty blocks if it has fewer than 4 items */}
                              {slideShips.length < 4 && Array.from({ length: 4 - slideShips.length }).map((_, emptyIdx) => (
                                <div key={`empty-${emptyIdx}`} className="relative aspect-[16/8] border border-dashed border-white/5 rounded-xl opacity-20" />
                              ))}
                            </div>
                          );
                        })}
                      </div>

                      {/* Carousel Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-2.5">
                          <button
                            onClick={() => scrollToPage(Math.max(0, capitalPage - 1))}
                            disabled={capitalPage === 0}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-lime-400/40 transition-all disabled:opacity-30 text-[10px] font-mono font-bold uppercase tracking-widest"
                          >‹ Prev</button>
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }).map((_, pi) => (
                              <button
                                key={pi}
                                onClick={() => scrollToPage(pi)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${pi === capitalPage ? 'bg-lime-400 w-4' : 'bg-white/20 hover:bg-white/40'
                                  }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => scrollToPage(Math.min(totalPages - 1, capitalPage + 1))}
                            disabled={capitalPage === totalPages - 1}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-lime-400/40 transition-all disabled:opacity-30 text-[10px] font-mono font-bold uppercase tracking-widest"
                          >Next ›</button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 border-t border-white/[0.07]">
                {[
                  { tag: 'S', label: shipsReadyLabel, val: formatNumber(totalShips) },
                  { tag: 'T', label: totalValueLabel, val: formatCurrency(totalValue) },
                  { tag: 'C', label: crewSeatsLabel, val: formatNumber(totalMaxCrew) },
                ].map((s, i) => (
                  <div key={s.tag} className={`flex flex-col items-center justify-center py-3 px-2 ${i > 0 ? 'border-l border-white/[0.07]' : ''}`}>
                    <div className="text-[8px] font-mono font-black text-lime-400/60 uppercase tracking-[0.3em] mb-0.5">{s.label}</div>
                    <div className="text-lg font-black text-white leading-none">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Panel B: Standard Fleets ── */}
            <div className="relative flex flex-col rounded-[1.75rem] border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.07)] flex-1 overflow-hidden">
              <div className="p-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-lime-400/50 mb-0.5">{standardKicker}</div>
                    <div className="text-base font-black uppercase text-white">{standardHeading}</div>
                  </div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{standardFleets.length} vessels</div>
                </div>
                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-[11px] font-mono text-white placeholder-white/25 outline-none focus:border-lime-400/40 transition-colors"
                  />
                </div>
              </div>

              {/* Ships grid — scrollable */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {standardFleets.map((ship, i) => {
                    const isExpanded = expandedSlug === ship.id;
                    return (
                      <div key={ship.id} className="relative aspect-[16/10]">
                        <button
                          onClick={() => {
                            if (ship.count > 1) {
                              setExpandedSlug(isExpanded ? null : ship.id);
                            } else {
                              setSelectedIndex(ship.originalIndex);
                            }
                          }}
                          className={`group absolute inset-0 w-full h-full rounded-xl overflow-hidden transition-all duration-300
                          ${activeShip?.id === ship.id
                              ? 'border-2 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                              : 'border border-white/[0.08] hover:border-lime-400/30'
                            }`}
                        >
                          {/* Stacking effect */}
                          {ship.count > 1 && !isExpanded && (
                            <>
                              <div className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl translate-x-1.5 translate-y-1.5 -z-10" />
                              <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-xl translate-x-3 translate-y-3 -z-20" />
                            </>
                          )}

                          <div className={`absolute inset-0 transition-all ${isExpanded ? 'opacity-20' : ''}`}>
                            {ship.thumbnail
                              ? <img src={ship.thumbnail} alt={ship.name} className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 saturate-125 contrast-105" />
                              : <div className="absolute inset-0 bg-gradient-to-br from-lime-900/10 to-black/50" />
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute top-2 left-2 bg-white/10 text-white/70 font-black text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                              {getSfTag(i)}
                            </div>

                            {ship.count > 1 && (
                              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur border border-white/10 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                                ×{ship.count}
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                              <div className="text-[9px] font-mono text-lime-300/60 uppercase truncate leading-[1.4] py-0.5">{ship.manufacturer}</div>
                              <div className="text-xs font-mono font-black uppercase text-white leading-[1.4] py-0.5 truncate">{ship.name}</div>
                            </div>
                          </div>
                        </button>

                        {/* Expanded View */}
                        {isExpanded && (
                          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md rounded-xl border border-lime-400/30 p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                            <div className="flex justify-between items-center mb-1 sticky top-0 bg-black/90 pb-1 z-10">
                              <span className="text-[9px] font-black uppercase text-lime-400 tracking-widest px-1">Select Asset</span>
                              <button onClick={(e) => { e.stopPropagation(); setExpandedSlug(null); }} className="text-white/50 hover:text-white"><X size={12} /></button>
                            </div>
                            {ship.instances?.map((inst, idx) => (
                              <button
                                key={idx}
                                onClick={() => { setSelectedIndex(inst.originalIndex); setExpandedSlug(null); }}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-lime-400/20 border border-white/10 hover:border-lime-400/40 text-left transition-all"
                              >
                                <div className="min-w-0 pr-2">
                                  {inst.ceo && <div className="text-[10px] font-black text-white uppercase truncate">{inst.ceo}</div>}
                                  <div className="text-[8px] text-lime-400/60 font-mono tracking-widest">Qty: {inst.qty}</div>
                                </div>
                                <div className="shrink-0 w-3 h-3 rounded-full border border-lime-400/30 flex items-center justify-center">
                                  {activeShip?.id === inst.id && <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {standardFleets.length === 0 && !loadingShips && (
                    <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-white/10 aspect-[4/1] text-white/25 text-[10px] font-mono uppercase tracking-widest">
                      Admin has not added standard fleets
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════ RIGHT COLUMN ═══════════════════════ */}
          <div className="flex flex-col gap-3 h-full overflow-hidden">

            {/* ── 3D Stage: Square viewer ── */}
            <div className="flex-1 relative rounded-[1.75rem] border border-white/[0.07] bg-[#010201] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04)] min-h-0">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_80%,rgba(101,163,13,0.10),transparent)]" />

              {/* Loading badge */}
              {loadingSelectedShip && (
                <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-lime-300/15 bg-black/70 px-3 py-1.5 backdrop-blur">
                  <div className="w-2.5 h-2.5 border border-lime-400/60 border-t-lime-400 rounded-full animate-spin" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-lime-100/55">Loading...</span>
                </div>
              )}

              {/* HUD top-left */}
              <div className="absolute top-5 left-5 z-20">
                <div className="text-[9px] font-mono font-black uppercase tracking-[0.36em] text-lime-400/50">Ship Stage</div>
                <div className="mt-0.5 text-2xl font-black uppercase tracking-[-0.05em] text-white/90 leading-none">
                  {activeShip?.name || <span className="text-white/20">Select a Ship</span>}
                </div>
                {activeShip && (
                  <div className="mt-1 text-[9px] font-mono text-lime-300/50 uppercase tracking-wider">{activeShip.manufacturer} · {activeShip.class}</div>
                )}
              </div>

              {/* 3D scene */}
              <div className="absolute inset-0">
                <FleetScene selectedShip={activeShip} />
              </div>

              {/* Nav hint */}
              <div className="absolute bottom-4 right-5 z-20 text-[9px] font-mono text-white/20 uppercase tracking-widest hidden lg:block">
                ← → to cycle ships
              </div>
            </div>

            {/* ── Ship Details Panel ── */}
            <div className="shrink-0 h-[190px]">
              <FleetShipDetails ship={activeShip} stackedCeos={activeShip ? slugGroups[activeShip.slug]?.stackedCeos : null} />
            </div>

          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(163, 230, 53, 0.15); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(163, 230, 53, 0.35); }
      `}</style>
    </div>
  );
}
