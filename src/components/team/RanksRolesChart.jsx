'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — matching the original Lucidchart
// Yellow  = single role positions
// Red     = training positions
// Orange  = dual role positions
// Silver  = not part of Polaris crew
// Green   = command track
// Purple  = special / high council
// ─────────────────────────────────────────────────────────────────────────────
const YELLOW = '#fcce14';
const RED = '#fe7070';
const SILVER = '#cbc2a3';
const ORANGE = '#cc4e00';
const GREEN = '#008a0e';
const PURPLE = '#635dff';
const BLUE = '#1071e5';

// ─────────────────────────────────────────────────────────────────────────────
// CHART DATA — "Ranks and Roles for Star Citizen 1.0"
// Rebuilt from the source Lucidchart export (KHALAI_CHARTING) — every node
// below is a real rank/role pulled from that chart, grouped into the same
// career tracks the org used, with requirement text taken from the chart's
// requirement callouts.
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS = [
  // ── FLIGHT TRACK ─────────────────────────────────────────────────────────
  {
    id: 'flight',
    label: 'FLIGHT',
    icon: '✈',
    nodes: [
      { id: 'f0', label: 'STARMAN', rank: 'E1', color: SILVER, req: 'Basic knowledge of character, FPS, tools\n20 hours in-game experience' },
      { id: 'f1', label: 'PILOT\nTRAINEE', rank: 'E2', color: SILVER, req: 'Enrolled in Flight School' },
      { id: 'f2', label: 'PILOT\nCADET', rank: 'E3', color: RED, req: 'Flight School Test 50%+' },
      { id: 'f3', label: 'CO-PILOT', rank: 'O1', color: ORANGE, req: 'Officers Interview\nFlight School Test passed\nMulticrew vessel training 4h+' },
      { id: 'f4', label: 'PILOT', rank: 'O2', color: YELLOW, req: 'Combat School Test passed\nFlight School Test passed\nMulticrew vessel training 8h+' },
      { id: 'f5', label: 'FLIGHT\nLIEUTENANT', rank: 'O2', color: YELLOW, req: 'Officers Interview\nCombat School Test passed\nPersonal spacecraft training 8h+' },
      { id: 'f6', label: 'FLYING\nOFFICER', rank: 'O3', color: YELLOW, req: 'Officers Interview\nFlight Lieutenant experience: 2 battles' },
      { id: 'f7', label: 'FLIGHT\nCAPTAIN', rank: 'O3', color: YELLOW, req: 'Small multicrew ships\nFlight Lieutenant experience: 2 battles' },
      { id: 'f8', label: 'SQUADRON\nLEADER', rank: 'O4', color: YELLOW, req: 'Officers Interview\nFlight Captain experience: 5 battles' },
      { id: 'f9', label: 'GROUP\nCAPTAIN', rank: 'O5', color: YELLOW, req: 'Squadron Leader experience across multiple squads' },
      { id: 'f10', label: 'WING\nCOMMANDER', rank: 'C1', color: GREEN, req: 'Commanders Board Approval\nSquadron Leader: 10 battles, 1 war' },
      { id: 'f11', label: 'FLEET\nCOMMAND', rank: 'C2', color: GREEN, req: 'Fleet-level flight command authority' },
    ],
  },

  // ── ENGINEERING TRACK ─────────────────────────────────────────────────────
  {
    id: 'engineering',
    label: 'ENGINEERING',
    icon: '⚙',
    nodes: [
      { id: 'e0', label: 'ADEPT\nSTARMAN', rank: 'E1', color: RED, req: 'Adept Starman Test passed (written + in-game)' },
      { id: 'e1', label: 'ENGINEERING\nPRIVATE', rank: 'E3', color: RED, req: 'Adept Starman Test passed\nShip & component knowledge' },
      { id: 'e2', label: 'SHIP\nENGINEER', rank: 'E4', color: ORANGE, req: 'Extensive ship & component knowledge\nMastery of multi tool, cambio, maxlift' },
      { id: 'e3', label: 'HANGAR\nENGINEER', rank: 'E4', color: ORANGE, req: 'Hangar & Upper Deck engineering specialist' },
      { id: 'e4', label: 'ENGINEERING\nSERGEANT', rank: 'E5', color: ORANGE, req: 'Senior engineering NCO responsibilities' },
      { id: 'e5', label: 'CHIEF\nENGINEER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nMastery of ship systems & component knowledge' },
      { id: 'e6', label: 'ENGINEERING\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nExtensive ship & component knowledge' },
    ],
  },

  // ── GUNNERY TRACK ─────────────────────────────────────────────────────────
  {
    id: 'gunnery',
    label: 'GUNNERY',
    icon: '🎯',
    nodes: [
      { id: 'g0', label: 'GUNMAN\nCADET', rank: 'E1', color: SILVER, req: 'Enrolled turret gunnery trainee' },
      { id: 'g1', label: 'GUNMAN', rank: 'E2', color: SILVER, req: 'Basic turret familiarity' },
      { id: 'g2', label: 'GUNMAN\nFIRST CLASS', rank: 'E3', color: SILVER, req: 'Basic ship weapon knowledge' },
      { id: 'g3', label: 'GUNNERY\nPRIVATE', rank: 'E3', color: RED, req: 'Adept Starman Test passed\nBasic turret weapon loadout knowledge' },
      { id: 'g4', label: 'GUNNERY\nSERGEANT', rank: 'E5', color: ORANGE, req: 'Extensive turret loadout & gunning knowledge\nOpponent ship weak-point knowledge' },
      { id: 'g5', label: 'GUNMASTER', rank: 'E5', color: ORANGE, req: 'Ground Infantry passed\nCombat School Test 75%+' },
      { id: 'g6', label: 'GUN\nSPECIALIST', rank: 'O1', color: YELLOW, req: 'Officers Interview\nGround Infantry passed\nCombat School Test 75%+' },
      { id: 'g7', label: 'WEAPONS\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nExtensive turret weapon & loadout knowledge' },
      { id: 'g8', label: 'WEAPONS\nENGINEER', rank: 'O2', color: ORANGE, req: 'Torpedo & remote turret weapon systems' },
      { id: 'g9', label: 'WEAPONS\nMANAGER', rank: 'O3', color: YELLOW, req: 'Oversees all shipboard weapons stations' },
    ],
  },

  // ── GROUND OPS TRACK ──────────────────────────────────────────────────────
  {
    id: 'ground',
    label: 'GROUND OPS',
    icon: '⚔',
    nodes: [
      { id: 'i0', label: 'ORDINARY\nENLISTMENT', rank: 'E1', color: SILVER, req: 'Base recruit enlistment' },
      { id: 'i1', label: 'ORDINARY\nGROUNDMAN', rank: 'E2', color: SILVER, req: 'Basic FPS familiarity' },
      { id: 'i2', label: 'GROUND\nINFANTRY', rank: 'E4', color: RED, req: 'Ground Infantry Test passed\nCombat School Test 50%+' },
      { id: 'i3', label: 'WEAPON\nSPECIALIST', rank: 'E5', color: ORANGE, req: 'Ground Infantry passed\nExtensive FPS weapon knowledge' },
      { id: 'i4', label: 'MILITARY\nPOLICE', rank: 'O2', color: ORANGE, req: 'Ground Infantry requirements met\nDiscipline & order enforcement' },
      { id: 'i5', label: 'BRIG\nWARDEN', rank: 'O2', color: ORANGE, req: 'Detention & brig operations oversight' },
      { id: 'i6', label: 'COMBAT\nCAPTAIN', rank: 'O3', color: YELLOW, req: 'Officers Interview\nGround Infantry passed, FPS tactics & comms training' },
      { id: 'i7', label: 'GROUND OPS\nCAPTAIN', rank: 'O3', color: YELLOW, req: 'Command of ground operations squads' },
    ],
  },

  // ── LOGISTICS TRACK ───────────────────────────────────────────────────────
  {
    id: 'logistics',
    label: 'LOGISTICS',
    icon: '📦',
    nodes: [
      { id: 'l0', label: 'LOGISTICS\nPRIVATE', rank: 'E3', color: RED, req: 'Adept Starman Test passed\nBasic cargo knowledge' },
      { id: 'l1', label: 'LOGISTICS\nSERGEANT', rank: 'E5', color: ORANGE, req: 'Cargo hauling reputation 3+\nUsage of multi tool, maxlift' },
      { id: 'l2', label: 'LOGISTICS\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nCombat School Test passed\nCargo hauling rep 3+' },
      { id: 'l3', label: 'LOGISTICS\nCOORDINATOR', rank: 'O3', color: ORANGE, req: 'Officers Interview\nAdvanced ship cargo knowledge & procurement' },
      { id: 'l4', label: 'OUTPOST\nOFFICER', rank: 'O2', color: YELLOW, req: 'Oversees outpost supply & staging' },
    ],
  },

  // ── MEDICAL TRACK ─────────────────────────────────────────────────────────
  {
    id: 'medical',
    label: 'MEDICAL',
    icon: '✚',
    nodes: [
      { id: 'm0', label: 'MEDIC', rank: 'E2', color: RED, req: 'Basic medical training' },
      { id: 'm1', label: 'FIELD\nMEDIC', rank: 'E3', color: ORANGE, req: 'Field triage & combat first aid' },
      { id: 'm2', label: 'COMBAT\nMEDIC', rank: 'E4', color: ORANGE, req: 'Combat-zone casualty response' },
      { id: 'm3', label: 'MEDICAL\nSERGEANT', rank: 'E5', color: ORANGE, req: 'Senior medical NCO responsibilities' },
      { id: 'm4', label: 'MEDICAL\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nAdvanced medical knowledge' },
      { id: 'm5', label: 'SURGEON', rank: 'O3', color: YELLOW, req: 'Full medical mastery, surgical procedures' },
    ],
  },

  // ── TRADE & INDUSTRY TRACK ────────────────────────────────────────────────
  {
    id: 'trade',
    label: 'TRADE & INDUSTRY',
    icon: '🛠',
    nodes: [
      { id: 't0', label: 'TRADESMEN', rank: 'E2', color: SILVER, req: 'Entry-level trade & production hand' },
      { id: 't1', label: 'MINER', rank: 'E3', color: SILVER, req: 'Mining & Arastra operations' },
      { id: 't2', label: 'CRAFTSMAN', rank: 'E3', color: RED, req: 'Adept Starman Test passed\nBase production knowledge' },
      { id: 't3', label: 'MECHANIC', rank: 'E4', color: ORANGE, req: 'Ship & ground vehicle maintenance' },
      { id: 't4', label: 'GUNSMITH', rank: 'E4', color: ORANGE, req: 'Weapon fabrication & customization' },
      { id: 't5', label: 'MASTER\nCRAFTSMAN', rank: 'E5', color: ORANGE, req: 'Advanced production & refining mastery' },
      { id: 't6', label: 'TRADE\nLEADER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nLeads a trade/production unit' },
      { id: 't7', label: 'BUSINESS\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nOrg trade & commerce oversight' },
      { id: 't8', label: 'SALES\nCOORDINATOR', rank: 'O2', color: ORANGE, req: 'Coordinates sales unit operations' },
      { id: 't9', label: 'ARCHITECT', rank: 'O2', color: YELLOW, req: 'Base building & construction design' },
      { id: 't10', label: 'INDUSTRIAL\nLIEUTENANT', rank: 'O2', color: YELLOW, req: 'Industrial operations command, junior' },
      { id: 't11', label: 'INDUSTRIAL\nCAPTAIN', rank: 'O3', color: YELLOW, req: 'Industrial operations command, senior' },
    ],
  },

  // ── COMMAND TRACK ─────────────────────────────────────────────────────────
  {
    id: 'command',
    label: 'COMMAND',
    icon: '★',
    nodes: [
      { id: 'c0', label: 'EXECUTIVE\nOFFICER', rank: 'O5', color: YELLOW, req: 'Second-in-command; relay point from CO\nCoordinates all sub-teams' },
      { id: 'c1', label: 'COMMANDING\nOFFICER', rank: 'C1', color: GREEN, req: 'Plans & maps out full operation scenarios' },
      { id: 'c2', label: 'GROUP\nCOMMANDER', rank: 'C1', color: GREEN, req: 'Commanders Board Approval' },
      { id: 'c3', label: 'PLANETARY\nCOMMANDER', rank: 'C2', color: GREEN, req: 'Commanders Board Approval\nSurface operations authority' },
      { id: 'c4', label: 'SYSTEM\nCAPTAIN', rank: 'C2', color: GREEN, req: 'Commanders Board Approval\nSystem-wide operations authority' },
      { id: 'c5', label: 'FLEET\nCAPTAIN', rank: 'C2', color: GREEN, req: 'Commanders Board Approval\nCommanding Officer experience: 10 battles, 2 wars' },
      { id: 'c6', label: 'COMMANDER\nIN CHIEF', rank: 'C3', color: GREEN, req: 'Elected by High Council\nCommanding Officer experience: 50 battles, 5 wars' },
    ],
  },

  // ── HIGH COUNCIL ──────────────────────────────────────────────────────────
  {
    id: 'council',
    label: 'HIGH COUNCIL',
    icon: '👑',
    nodes: [
      { id: 'hc0', label: 'ORG\nLEAD', rank: 'SPL', color: PURPLE, req: 'Top-level organizational leadership' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RANK SCALE (top header)
// ─────────────────────────────────────────────────────────────────────────────
const RANK_SCALE = [
  { code: 'E1', label: 'ENLIST' },
  { code: 'E2', label: 'CITIZEN' },
  { code: 'E3', label: 'PRIVATE' },
  { code: 'E4', label: 'SERGEANT' },
  { code: 'E5', label: 'WARRANT' },
  { code: 'O1', label: '2ND LT' },
  { code: 'O2', label: 'LIEUTENANT' },
  { code: 'O3', label: 'CAPTAIN' },
  { code: 'O4', label: 'SQN LEADER' },
  { code: 'O5', label: 'SQN LEADER' },
  { code: 'C1', label: 'CMD OFFICER' },
  { code: 'C2', label: 'FLEET CPT' },
  { code: 'C3', label: 'C-IN-C' },
  { code: 'SPL', label: 'SPECIAL' },
];

// Map rank code to column index
const RANK_COL = Object.fromEntries(RANK_SCALE.map((r, i) => [r.code, i]));
const COL_W = 152; // px per column
const ROW_H = 84;  // px per track row
const NODE_H = 58; // node height
const HEADER_H = 72;
const TRACK_GAP = 14;

// ─────────────────────────────────────────────────────────────────────────────
// COLOR → KM DARK STYLE
// ─────────────────────────────────────────────────────────────────────────────
const nodeStyle = (color) => {
  const map = {
    [YELLOW]: { bg: 'rgba(252,206,20,0.12)', border: '#fcce14', text: '#fcce14', glow: '#fcce1440' },
    [RED]: { bg: 'rgba(254,112,112,0.10)', border: '#fe7070', text: '#fe7070', glow: '#fe707030' },
    [SILVER]: { bg: 'rgba(203,194,163,0.08)', border: '#cbc2a3', text: '#cbc2a3', glow: '#cbc2a320' },
    [ORANGE]: { bg: 'rgba(204,78,0,0.12)', border: '#cc7a00', text: '#e8a030', glow: '#cc4e0030' },
    [GREEN]: { bg: 'rgba(0,138,14,0.15)', border: '#00ff41', text: '#00ff41', glow: '#00ff4140' },
    [PURPLE]: { bg: 'rgba(99,93,255,0.15)', border: '#635dff', text: '#a09dff', glow: '#635dff40' },
    [BLUE]: { bg: 'rgba(16,113,229,0.15)', border: '#1071e5', text: '#60a5fa', glow: '#1071e540' },
  };
  return map[color] || map[SILVER];
};

// ─────────────────────────────────────────────────────────────────────────────
// NODE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const OrgNode = ({ node, x, y, isAdmin, isDragging, onMouseDown, onTouchStart }) => {
  const [hovered, setHovered] = useState(false);
  const s = nodeStyle(node.color);
  const lines = node.label.split('\n');

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{ cursor: isAdmin ? (isDragging ? 'grabbing' : 'grab') : 'pointer' }}
    >
      {/* Glow */}
      {(hovered || isDragging) && (
        <rect
          x={-4} y={-4}
          width={COL_W - 16 + 8} height={NODE_H + 8}
          rx={10}
          fill={s.glow}
          filter="url(#glow)"
        />
      )}
      {/* Box */}
      <rect
        x={0} y={0}
        width={COL_W - 16} height={NODE_H}
        rx={8}
        fill={s.bg}
        stroke={isDragging ? '#00ff41' : s.border}
        strokeWidth={isDragging ? 2.5 : (hovered ? 1.5 : 1)}
        style={{ transition: isDragging ? 'none' : 'all 0.15s' }}
      />
      {/* Top accent line */}
      <line
        x1={8} y1={0} x2={COL_W - 24} y2={0}
        stroke={isDragging ? '#00ff41' : s.border} strokeWidth={1.5} opacity={0.7}
      />
      {/* Corner marks */}
      <path d="M0,0 L5,0 M0,0 L0,5" stroke={s.border} strokeWidth={1.5} opacity={0.8} />
      <path d={`M${COL_W - 16},0 L${COL_W - 21},0 M${COL_W - 16},0 L${COL_W - 16},5`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />
      <path d={`M0,${NODE_H} L5,${NODE_H} M0,${NODE_H} L0,${NODE_H - 5}`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />
      <path d={`M${COL_W - 16},${NODE_H} L${COL_W - 21},${NODE_H} M${COL_W - 16},${NODE_H} L${COL_W - 16},${NODE_H - 5}`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />

      {/* Admin Drag Handle indicator when hovered & isAdmin */}
      {isAdmin && (hovered || isDragging) && (
        <text
          x={6}
          y={14}
          fontSize={9}
          fill="#00ff41"
          opacity={0.85}
          fontWeight={900}
        >⋮⋮</text>
      )}

      {/* Rank badge */}
      <text
        x={COL_W - 22}
        y={14}
        textAnchor="end"
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={800}
        fill={s.border}
        opacity={0.75}
        letterSpacing={0.5}
      >{node.rank}</text>

      {/* Label */}
      {lines.map((line, i) => (
        <text
          key={i}
          x={(COL_W - 16) / 2}
          y={lines.length === 1 ? NODE_H / 2 + 4 : (i === 0 ? NODE_H / 2 - 4 : NODE_H / 2 + 10)}
          textAnchor="middle"
          fontSize={lines.length === 1 ? 10.5 : 9.5}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={700}
          fill={s.text}
          letterSpacing={0.6}
        >{line}</text>
      ))}

      {/* Tooltip */}
      {hovered && !isDragging && node.req && (
        <g transform={`translate(${(COL_W - 16) / 2}, ${NODE_H + 8})`}>
          {/* Tooltip box */}
          <rect
            x={-120} y={0}
            width={240} height={node.req.split('\n').length * 17 + 14}
            rx={6}
            fill="#050d06"
            stroke={s.border}
            strokeWidth={1.5}
          />
          {node.req.split('\n').map((line, i) => (
            <text
              key={i}
              x={0} y={16 + i * 17}
              textAnchor="middle"
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight={600}
              fill={s.text}
              opacity={0.95}
            >{line}</text>
          ))}
        </g>
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHART
// ─────────────────────────────────────────────────────────────────────────────
const RanksRolesChart = ({ isAdmin = false }) => {
  const svgRef = useRef(null);

  // Load custom node offsets from localStorage
  const [nodePositions, setNodePositions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kmhq_ranks_chart_positions');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return {};
  });

  // Drag state
  const [activeDrag, setActiveDrag] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(nodePositions).length > 0) {
      try {
        localStorage.setItem('kmhq_ranks_chart_positions', JSON.stringify(nodePositions));
      } catch (e) { }
    }
  }, [nodePositions]);

  // Convert mouse/touch event to SVG coordinate space
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: e.clientX, y: e.clientY };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const viewBox = svgRef.current.viewBox?.baseVal;
    const scaleX = viewBox && viewBox.width > 0 ? viewBox.width / rect.width : 1;
    const scaleY = viewBox && viewBox.height > 0 ? viewBox.height / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e, nodeId) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    const coords = getSvgCoordinates(e);
    const initialOffset = nodePositions[nodeId] || { dx: 0, dy: 0 };
    setActiveDrag({
      nodeId,
      startX: coords.x,
      startY: coords.y,
      initialDx: initialOffset.dx || 0,
      initialDy: initialOffset.dy || 0,
    });
  };

  const handleMouseMove = (e) => {
    if (!activeDrag || !isAdmin) return;
    const coords = getSvgCoordinates(e);
    const deltaX = coords.x - activeDrag.startX;
    const deltaY = coords.y - activeDrag.startY;

    setNodePositions((prev) => ({
      ...prev,
      [activeDrag.nodeId]: {
        dx: Math.round(activeDrag.initialDx + deltaX),
        dy: Math.round(activeDrag.initialDy + deltaY),
      },
    }));
  };

  const handleMouseUp = () => {
    if (activeDrag) {
      setActiveDrag(null);
    }
  };

  const handleResetLayout = () => {
    setNodePositions({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kmhq_ranks_chart_positions');
      } catch (e) { }
    }
  };

  const totalCols = RANK_SCALE.length;
  const chartW = totalCols * COL_W + 160;
  const chartH = HEADER_H + TRACKS.length * (ROW_H + TRACK_GAP) + 40;
  const hasCustomPositions = Object.keys(nodePositions).length > 0;

  return (
    <div className="w-full rounded-[2rem] border border-lime-300/10 overflow-hidden select-none"
      style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.03) 0%,rgba(2,6,3,0.95) 60%)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_6px_#00ff41]" />
          <span className="font-mono text-[10px] font-black tracking-[0.25em] text-lime-400/60 uppercase">
            Ranks &amp; Roles · Star Citizen 1.0
          </span>
          {isAdmin && (
            <span className="ml-2 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admin Drag &amp; Drop Active
            </span>
          )}
        </div>

        {/* Legend & Admin Controls */}
        <div className="flex items-center gap-4">
          {isAdmin && hasCustomPositions && (
            <button
              onClick={handleResetLayout}
              className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              Reset Layout
            </button>
          )}

          {[
            { color: YELLOW, label: 'Single Role' },
            { color: RED, label: 'Training' },
            { color: ORANGE, label: 'Dual Role' },
            { color: SILVER, label: 'Non-Polaris' },
            { color: GREEN, label: 'Command' },
          ].map(({ color, label }) => {
            const s = nodeStyle(color);
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm border"
                  style={{ background: s.bg, borderColor: s.border }}
                />
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: s.text }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SVG Chart ──────────────────────────────────────── */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <svg
          ref={svgRef}
          width={chartW}
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── Rank column header ── */}
          {RANK_SCALE.map((r, ci) => {
            const cx = 150 + ci * COL_W + (COL_W - 16) / 2;
            return (
              <g key={r.code}>
                {/* Vertical guide line */}
                <line
                  x1={150 + ci * COL_W + (COL_W - 16) / 2}
                  y1={HEADER_H - 8}
                  x2={150 + ci * COL_W + (COL_W - 16) / 2}
                  y2={chartH - 20}
                  stroke="#ffffff08"
                  strokeWidth={1}
                  strokeDasharray="3 6"
                />
                {/* Column header box */}
                <rect
                  x={150 + ci * COL_W}
                  y={8}
                  width={COL_W - 16}
                  height={46}
                  rx={6}
                  fill="rgba(255,255,255,0.025)"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={1}
                />
                <text
                  x={cx} y={27}
                  textAnchor="middle"
                  fontSize={11.5}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={900}
                  fill="rgba(255,255,255,0.65)"
                  letterSpacing={1}
                >{r.code}</text>
                <text
                  x={cx} y={43}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={700}
                  fill="rgba(255,255,255,0.35)"
                  letterSpacing={0.5}
                >{r.label}</text>
              </g>
            );
          })}

          {/* ── Track rows ── */}
          {TRACKS.map((track, ti) => {
            const trackY = HEADER_H + ti * (ROW_H + TRACK_GAP);

            // Calculate actual coordinates for all nodes in this track
            const nodesWithCoords = track.nodes.map((node) => {
              const colIdx = RANK_COL[node.rank] ?? 0;
              const defaultX = 150 + colIdx * COL_W;
              const offset = nodePositions[node.id] || { dx: 0, dy: 0 };
              return {
                node,
                x: defaultX + offset.dx,
                y: trackY + offset.dy,
              };
            }).sort((a, b) => a.x - b.x);

            return (
              <g key={track.id}>
                {/* Track label (left side) */}
                <rect
                  x={4} y={trackY + 2}
                  width={138} height={NODE_H - 4}
                  rx={6}
                  fill="rgba(0,255,65,0.04)"
                  stroke="rgba(0,255,65,0.1)"
                  strokeWidth={1}
                />
                <text
                  x={9} y={trackY + NODE_H / 2 - 2}
                  fontSize={15}
                  fontFamily="sans-serif"
                  fill="rgba(255,255,255,0.5)"
                >{track.icon}</text>
                <text
                  x={30} y={trackY + NODE_H / 2 + 3}
                  fontSize={9}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={900}
                  fill="rgba(255,255,255,0.5)"
                  letterSpacing={1}
                >{track.label}</text>

                {/* Connectors & Arrows between consecutive nodes */}
                {nodesWithCoords.length > 1 &&
                  nodesWithCoords.slice(0, -1).map((item, i) => {
                    const nextItem = nodesWithCoords[i + 1];
                    const x1 = item.x + (COL_W - 16);
                    const y1 = item.y + NODE_H / 2;
                    const x2 = nextItem.x;
                    const y2 = nextItem.y + NODE_H / 2;
                    const s = nodeStyle(item.node.color);

                    if (x2 <= x1 + 2 && Math.abs(y1 - y2) < 5) return null;

                    const dx = x2 - x1;
                    const midX = x1 + dx / 2;
                    const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 5} ${y2}`;

                    return (
                      <g key={`connector-${track.id}-${i}`}>
                        <path
                          d={pathD}
                          stroke={s.border}
                          strokeWidth={1.5}
                          fill="none"
                          opacity={0.45}
                          strokeDasharray="4 3"
                        />
                        <polygon
                          points={`${x2 - 1},${y2} ${x2 - 6},${y2 - 3} ${x2 - 6},${y2 + 3}`}
                          fill={s.border}
                          opacity={0.6}
                        />
                      </g>
                    );
                  })}

                {/* Nodes */}
                {nodesWithCoords.map(({ node, x, y }) => (
                  <OrgNode
                    key={node.id}
                    node={node}
                    x={x}
                    y={y}
                    isAdmin={isAdmin}
                    isDragging={activeDrag?.nodeId === node.id}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    onTouchStart={(e) => handleMouseDown(e, node.id)}
                  />
                ))}
              </g>
            );
          })}

          {/* ── Scanlines overlay ── */}
          <rect
            x={0} y={0} width={chartW} height={chartH}
            fill="url(#scanlines)"
            opacity={0.04}
            pointerEvents="none"
          />
          <defs>
            <pattern id="scanlines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
              <rect x="0" y="3" width="1" height="1" fill="black" />
            </pattern>
          </defs>
        </svg>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-6 py-2 border-t border-white/5 flex flex-wrap items-center gap-6 text-[8px] font-mono font-black uppercase tracking-widest text-white/15">
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: YELLOW }} />
          Single Role
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
          Training Required
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} />
          Dual Role
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: SILVER }} />
          Non-Polaris Crew
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
          Command
        </span>
        <span className="ml-auto opacity-50">
          {isAdmin ? 'Drag nodes to customize position · hover nodes for requirements' : 'hover nodes for requirements'}
        </span>
      </div>
    </div>
  );
};

export default RanksRolesChart;