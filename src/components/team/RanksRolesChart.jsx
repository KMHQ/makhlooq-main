'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — matching the original Lucidchart
// ─────────────────────────────────────────────────────────────────────────────
const YELLOW = '#fcce14';
const RED = '#fe7070';
const SILVER = '#cbc2a3';
const ORANGE = '#cc4e00';
const GREEN = '#008a0e';
const PURPLE = '#635dff';
const BLUE = '#1071e5';

// ─────────────────────────────────────────────────────────────────────────────
// RANK SCALE (top header) — 13 columns, E1 → C3, matching the source chart
// ─────────────────────────────────────────────────────────────────────────────
const RANK_SCALE = [
  { code: 'E1', label: 'ENLIST' },
  { code: 'E2', label: 'CITIZEN' },
  { code: 'E3', label: 'SOLDIER' },
  { code: 'E4', label: 'CORPORAL' },
  { code: 'E5', label: 'SERGEANT' },
  { code: 'O1', label: '2ND LT' },
  { code: 'O2', label: 'LIEUTENANT' },
  { code: 'O3', label: 'CAPTAIN' },
  { code: 'O4', label: 'MAJOR' },
  { code: 'O5', label: 'SQN LEADER' },
  { code: 'C1', label: 'GROUP CMDR' },
  { code: 'C2', label: 'FLEET CMDR' },
  { code: 'C3', label: 'C-IN-C' },
];
const RANK_COL = Object.fromEntries(RANK_SCALE.map((r, i) => [r.code, i]));

// Sparse "legacy" rank labels shown only above a few columns, like the source chart
const SPARSE_HEADER = [
  { col: 'E1', label: 'RECRUIT' },
  { col: 'E3', label: 'PRIVATE' },
  { col: 'E5', label: 'SERGEANT' },
  { col: 'O1', label: 'WARRANT OFFICER' },
  { col: 'O5', label: 'MAJOR' },
];

// ─────────────────────────────────────────────────────────────────────────────
// CHART DATA — "Ranks and Roles for Star Citizen 1.0"
// Rebuilt directly from the source Lucidchart export (KHALAI_CHARTING.png):
// each row below is one horizontal career lane in the original chart.
// ─────────────────────────────────────────────────────────────────────────────

const TRACKS = [
  // ── Flight School decision gate (its own row, feeds into core lane) ───────
  {
    id: 'flight_entry',
    label: 'FLIGHT ENTRY',
    icon: '◆',
    nodes: [
      { id: 'fs', label: 'FLIGHT\nSCHOOL', rank: 'E3', color: YELLOW, shape: 'diamond', req: 'Decision gate\nPass → Pilot track\nFail → Navigations track' },
    ],
  },

  // ── Core command / flight / engineering / logistics / gunnery lane ────────
  {
    id: 'core',
    label: 'CORE / COMMAND',
    icon: '★',
    nodes: [
      { id: 'c0', label: 'ORDINARY\nSPACEMAN', rank: 'E1', color: YELLOW, req: 'Base enlistment' },
      { id: 'c1', label: 'STARMAN', rank: 'E2', color: YELLOW, req: 'Basic character & FPS familiarity' },
      { id: 'c2', label: 'ADEPT\nSTARMAN', rank: 'E3', color: YELLOW, req: 'Adept Starman Test passed' },

      { id: 'c3', label: 'ENGINEERING\nPRIVATE', rank: 'E4', color: YELLOW, req: 'Ship & component knowledge' },
      { id: 'c4', label: 'LOGISTICS\nPRIVATE', rank: 'E4', color: YELLOW, req: 'Basic cargo knowledge' },
      { id: 'c5', label: 'GUNNERY\nPRIVATE', rank: 'E4', color: YELLOW, req: 'Basic turret weapon loadout knowledge' },

      { id: 'c6', label: 'ENGINEERING\nSERGEANT', rank: 'E5', color: YELLOW, req: 'Senior engineering NCO responsibilities' },
      { id: 'c7', label: 'LOGISTICS\nSERGEANT', rank: 'E5', color: YELLOW, req: 'Cargo hauling reputation 3+' },
      { id: 'c8', label: 'GUNNERY\nSERGEANT', rank: 'E5', color: YELLOW, req: 'Extensive turret loadout & gunning knowledge' },

      { id: 'c9', label: 'ENGINEERING\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nExtensive ship & component knowledge' },
      { id: 'c10', label: 'LOGISTICS\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nCargo hauling rep 3+' },
      { id: 'c11', label: 'WEAPONS\nOFFICER', rank: 'O1', color: YELLOW, req: 'Officers Interview\nExtensive turret weapon knowledge' },
      { id: 'c12', label: 'PILOT\nTRAINEE', rank: 'O1', color: YELLOW, req: 'Enrolled in Flight School' },

      { id: 'c13', label: 'OPERATIONS\nCAPTAIN', rank: 'O2', color: YELLOW, req: 'Oversees engineering & logistics operations' },
      { id: 'c14', label: 'COMBAT\nSTRATEGIST', rank: 'O2', color: YELLOW, req: 'Oversees gunnery & combat operations' },
      { id: 'c15', label: 'FLIGHT\nLIEUTENANT', rank: 'O2', color: YELLOW, req: 'Officers Interview\nPersonal spacecraft training 8h+' },

      { id: 'c16', label: 'EXECUTIVE\nOFFICER', rank: 'O3', color: YELLOW, req: 'Second-in-command; relay point from CO' },
      { id: 'c17', label: 'FLYING\nOFFICER', rank: 'O3', color: YELLOW, req: 'Officers Interview\nFlight Lieutenant experience: 2 battles' },

      { id: 'c18', label: 'VESSEL\nCOMMANDING\nOFFICER', rank: 'O4', color: YELLOW, req: 'Commands an individual vessel' },
      { id: 'c19', label: 'WING\nCOMMANDER', rank: 'O4', color: YELLOW, req: 'Officers Interview\nSquadron Leader experience: 10 battles' },

      { id: 'c20', label: 'SQUADRON\nLEADER', rank: 'O5', color: YELLOW, req: 'Officers Interview\nFlight Captain experience: 5 battles' },

      { id: 'c21', label: 'FLEET\nCOMMAND', rank: 'C1', color: YELLOW, req: 'Fleet-level flight command authority' },
      { id: 'c22', label: 'GROUP\nCOMMANDER', rank: 'C1', color: YELLOW, req: 'Commanders Board Approval' },
    ],
  },

  // ── Navigations / medical lane ─────────────────────────────────────────────
  {
    id: 'nav_medical',
    label: 'NAVIGATIONS',
    icon: '✚',
    nodes: [
      { id: 'n0', label: 'COMBAT\nMEDIC', rank: 'E3', color: RED, req: 'Combat-zone casualty response' },
      { id: 'n1', label: 'NAVIGATIONS\nOPERATOR', rank: 'E4', color: RED, req: 'Flight School not passed — reassigned track' },
      { id: 'n2', label: 'NAVIGATIONS\nOFFICER', rank: 'O1', color: RED, req: 'Officers Interview\nAdvanced navigation & plotting' },
      { id: 'n3', label: 'MEDICAL\nSERGEANT', rank: 'E5', color: RED, req: 'Senior medical NCO responsibilities' },
      { id: 'n4', label: 'SURGEON', rank: 'O2', color: RED, req: 'Full medical mastery, surgical procedures' },
    ],
  },

  // ── Gunman / ground ops / command lane ─────────────────────────────────────
  {
    id: 'ground_ops',
    label: 'GROUND OPS',
    icon: '⚔',
    nodes: [
      { id: 'g0', label: 'ORDINARY\nENLISTMENT', rank: 'E1', color: RED, req: 'Base recruit enlistment' },
      { id: 'g1', label: 'GUNMAN', rank: 'E2', color: RED, req: 'Basic turret familiarity' },
      { id: 'g2', label: 'GUNMAN\nFIRST CLASS', rank: 'E3', color: RED, req: 'Basic ship weapon knowledge' },
      { id: 'g3', label: 'GUNSMITH', rank: 'E4', color: SILVER, req: 'Weapon fabrication & customization' },
      { id: 'g4', label: 'GUNMASTER', rank: 'E5', color: RED, req: 'Ground Infantry passed\nCombat School Test 75%+' },
      { id: 'g5', label: 'GUN\nSPECIALIST', rank: 'O1', color: RED, req: 'Officers Interview\nGround Infantry passed' },
      { id: 'g6', label: 'COMBAT\nCAPTAIN', rank: 'O3', color: RED, req: 'Officers Interview\nFPS tactics & comms training' },
      { id: 'g7', label: 'BRIGADE\nLEADER', rank: 'O4', color: RED, req: 'Commands a ground-ops brigade' },
      { id: 'g8', label: 'PLANETARY\nCOMMANDER', rank: 'C1', color: RED, req: 'Commanders Board Approval\nSurface operations authority' },
      { id: 'g9', label: 'SYSTEM\nCAPTAIN', rank: 'C2', color: RED, req: 'Commanders Board Approval\nSystem-wide operations authority' },
    ],
  },

  // ── Industrial / expedition lane ───────────────────────────────────────────
  {
    id: 'industrial',
    label: 'INDUSTRIAL',
    icon: '🛠',
    nodes: [
      { id: 'i0', label: 'MINER', rank: 'E3', color: RED, req: 'Mining & Arastra operations' },
      { id: 'i1', label: 'EXPEDITION\nSERGEANT', rank: 'E5', color: RED, req: 'Leads expedition & staging crews' },
      { id: 'i2', label: 'OUTPOST\nOFFICER', rank: 'O1', color: RED, req: 'Oversees outpost supply & staging' },
      { id: 'i3', label: 'INDUSTRIAL\nLIEUTENANT', rank: 'O2', color: RED, req: 'Industrial operations command, junior' },
      { id: 'i4', label: 'INDUSTRIAL\nCAPTAIN', rank: 'O3', color: RED, req: 'Industrial operations command, senior' },
      { id: 'i5', label: 'CLUSTER\nLEADER', rank: 'O4', color: RED, req: 'Multi-system industrial oversight' },
    ],
  },

  // ── Scout / base building lane ─────────────────────────────────────────────
  {
    id: 'scout_base',
    label: 'SCOUT / BASE',
    icon: '⛺',
    nodes: [
      { id: 's0', label: 'ORDINARY\nGROUNDMAN', rank: 'E1', color: SILVER, req: 'Base recruit, ground crew' },
      { id: 's1', label: 'SCOUT', rank: 'E2', color: SILVER, req: 'Reconnaissance & scouting' },
      { id: 's2', label: 'HUNTSMAN', rank: 'E3', color: SILVER, req: 'Resource & bounty tracking' },
      { id: 's3', label: 'ARCHITECT', rank: 'E4', color: SILVER, req: 'Base building & construction design' },
      { id: 's4', label: 'BASE\nOFFICER', rank: 'O1', color: SILVER, req: 'Officers Interview\nBase operations oversight' },
      { id: 's5', label: 'BASE\nCAPTAIN', rank: 'O3', color: SILVER, req: 'Command of a full base site' },
    ],
  },

  // ── Trade / craftsman lane ─────────────────────────────────────────────────
  {
    id: 'trade',
    label: 'TRADE',
    icon: '⚙',
    nodes: [
      { id: 't0', label: 'BASEMAN', rank: 'E2', color: SILVER, req: 'Entry-level trade & production hand' },
      { id: 't1', label: 'CRAFTSMAN', rank: 'E3', color: SILVER, req: 'Base production knowledge' },
      { id: 't2', label: 'MASTER\nCRAFTSMAN', rank: 'E5', color: SILVER, req: 'Advanced production & refining mastery' },
      { id: 't3', label: 'BUSINESS\nOFFICER', rank: 'O1', color: SILVER, req: 'Officers Interview\nOrg trade & commerce oversight' },
      { id: 't4', label: 'TRADE\nLEADER', rank: 'O2', color: SILVER, req: 'Leads a trade/production unit' },
    ],
  },

  // ── Sales lane ──────────────────────────────────────────────────────────────
  {
    id: 'sales',
    label: 'SALES',
    icon: '💠',
    nodes: [
      { id: 'sl0', label: 'TRADESMEN', rank: 'E2', color: SILVER, req: 'General trade hand' },
      { id: 'sl1', label: 'SALES\nCOORDINATOR', rank: 'O1', color: SILVER, req: 'Coordinates sales unit operations' },
    ],
  },

  // ── Medic lane ──────────────────────────────────────────────────────────────
  {
    id: 'medic',
    label: 'MEDIC',
    icon: '✚',
    nodes: [
      { id: 'm0', label: 'MEDIC', rank: 'E2', color: RED, req: 'Basic medical training' },
      { id: 'm1', label: 'FIELD\nMEDIC', rank: 'E3', color: SILVER, req: 'Field triage & combat first aid' },
    ],
  },
];

// Manual cross-lane connectors that the simple "adjacent column, same lane"
// logic can't express (decision-gate branches, lane merges, final hand-off).
const MANUAL_CONNECTORS = [
  { from: 'fs', to: 'c12', label: 'Yes' },
  { from: 'fs', to: 'n1', label: 'No' },
  { from: 'c9', to: 'c13' },
  { from: 'c10', to: 'c13' },
  { from: 'c10', to: 'c14' },
  { from: 'c11', to: 'c14' },
  { from: 't4', to: 'i5' },
  { from: 'c21', to: 'ORG_LEAD' },
];

const ORG_LEAD_NODE = { id: 'ORG_LEAD', label: 'ORG\nLEAD', rank: 'SPL', color: GREEN, req: 'Top-level organizational leadership' };

const COL_W = 152; // px per column
const ROW_H = 84;  // px per lane row
const NODE_H = 58; // node height
const HEADER_H = 92;
const TRACK_GAP = 14;
const LEFT_GUTTER = 150;

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
// NODE COMPONENT (supports rectangle + diamond decision-gate shape)
// ─────────────────────────────────────────────────────────────────────────────
const OrgNode = ({ node, x, y, isAdmin, isDragging, onMouseDown, onTouchStart }) => {
  const [hovered, setHovered] = useState(false);
  const s = nodeStyle(node.color);
  const lines = node.label.split('\n');
  const w = COL_W - 16;
  const isDiamond = node.shape === 'diamond';

  const diamondPoints = `${w / 2},-14 ${w + 14},${NODE_H / 2} ${w / 2},${NODE_H + 14} -14,${NODE_H / 2}`;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={isAdmin ? onMouseDown : undefined}
      onTouchStart={isAdmin ? onTouchStart : undefined}
      style={{ cursor: isAdmin ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {(hovered || isDragging) && (
        <rect
          x={-4} y={-4}
          width={w + 8} height={NODE_H + 8}
          rx={10}
          fill={s.glow}
          filter="url(#glow)"
        />
      )}

      {isDiamond ? (
        <polygon
          points={diamondPoints}
          fill={s.bg}
          stroke={isDragging ? '#00ff41' : s.border}
          strokeWidth={isDragging ? 2.5 : (hovered ? 1.5 : 1.5)}
          style={{ transition: isDragging ? 'none' : 'all 0.15s' }}
        />
      ) : (
        <>
          <rect
            x={0} y={0}
            width={w} height={NODE_H}
            rx={8}
            fill={s.bg}
            stroke={isDragging ? '#00ff41' : s.border}
            strokeWidth={isDragging ? 2.5 : (hovered ? 1.5 : 1)}
            style={{ transition: isDragging ? 'none' : 'all 0.15s' }}
          />
          <line x1={8} y1={0} x2={w - 8} y2={0} stroke={isDragging ? '#00ff41' : s.border} strokeWidth={1.5} opacity={0.7} />
          <path d="M0,0 L5,0 M0,0 L0,5" stroke={s.border} strokeWidth={1.5} opacity={0.8} />
          <path d={`M${w},0 L${w - 5},0 M${w},0 L${w},5`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />
          <path d={`M0,${NODE_H} L5,${NODE_H} M0,${NODE_H} L0,${NODE_H - 5}`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />
          <path d={`M${w},${NODE_H} L${w - 5},${NODE_H} M${w},${NODE_H} L${w},${NODE_H - 5}`} stroke={s.border} strokeWidth={1.5} opacity={0.8} />
        </>
      )}

      {isAdmin && (hovered || isDragging) && (
        <text x={6} y={14} fontSize={9} fill="#00ff41" opacity={0.85} fontWeight={900}>⋮⋮</text>
      )}

      {!isDiamond && (
        <text x={w - 6} y={14} textAnchor="end" fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={800} fill={s.border} opacity={0.75} letterSpacing={0.5}>
          {node.rank}
        </text>
      )}

      {lines.map((line, i) => (
        <text
          key={i}
          x={w / 2}
          y={lines.length === 1 ? NODE_H / 2 + 4 : (NODE_H / 2 - (lines.length - 1) * 7) + i * 14 + 4}
          textAnchor="middle"
          fontSize={lines.length > 2 ? 8.5 : 10}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={700}
          fill={s.text}
          letterSpacing={0.5}
        >{line}</text>
      ))}

      {hovered && !isDragging && node.req && (
        <g transform={`translate(${w / 2}, ${NODE_H + (isDiamond ? 20 : 8)})`}>
          <rect x={-120} y={0} width={240} height={node.req.split('\n').length * 17 + 14} rx={6} fill="#050d06" stroke={s.border} strokeWidth={1.5} />
          {node.req.split('\n').map((line, i) => (
            <text key={i} x={0} y={16 + i * 17} textAnchor="middle" fontSize={10} fontFamily="'JetBrains Mono', monospace" fontWeight={600} fill={s.text} opacity={0.95}>{line}</text>
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

  const [nodePositions, setNodePositions] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kmhq_ranks_chart_positions');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return {};
  });

  const [activeDrag, setActiveDrag] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(nodePositions).length > 0) {
      try {
        localStorage.setItem('kmhq_ranks_chart_positions', JSON.stringify(nodePositions));
      } catch (e) { }
    }
  }, [nodePositions]);

  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: e.clientX, y: e.clientY };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const viewBox = svgRef.current.viewBox?.baseVal;
    const scaleX = viewBox && viewBox.width > 0 ? viewBox.width / rect.width : 1;
    const scaleY = viewBox && viewBox.height > 0 ? viewBox.height / rect.height : 1;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e, nodeId) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    const coords = getSvgCoordinates(e);
    const initialOffset = nodePositions[nodeId] || { dx: 0, dy: 0 };
    setActiveDrag({ nodeId, startX: coords.x, startY: coords.y, initialDx: initialOffset.dx || 0, initialDy: initialOffset.dy || 0 });
  };

  const handleMouseMove = (e) => {
    if (!activeDrag || !isAdmin) return;
    const coords = getSvgCoordinates(e);
    const deltaX = coords.x - activeDrag.startX;
    const deltaY = coords.y - activeDrag.startY;
    setNodePositions((prev) => ({
      ...prev,
      [activeDrag.nodeId]: { dx: Math.round(activeDrag.initialDx + deltaX), dy: Math.round(activeDrag.initialDy + deltaY) },
    }));
  };

  const handleMouseUp = () => { if (activeDrag) setActiveDrag(null); };

  const handleResetLayout = () => {
    setNodePositions({});
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('kmhq_ranks_chart_positions'); } catch (e) { }
    }
  };

  // ── Layout pass: compute every track's y/height, then every node's x/y ────
  let currentY = HEADER_H;
  const trackLayouts = TRACKS.map((track) => {
    const counts = {};
    let max = 1;
    track.nodes.forEach(n => { counts[n.rank] = (counts[n.rank] || 0) + 1; if (counts[n.rank] > max) max = counts[n.rank]; });
    const trackHeight = Math.max(ROW_H, max * (NODE_H + 12) + 16);
    const layout = { ...track, y: currentY, height: trackHeight };
    currentY += trackHeight + TRACK_GAP;
    return layout;
  });

  const chartH = currentY + 40;
  const totalCols = RANK_SCALE.length;
  const chartW = totalCols * COL_W + LEFT_GUTTER + 200; // extra room for ORG LEAD
  const hasCustomPositions = Object.keys(nodePositions).length > 0;

  // Compute node coordinates for every track, and index them by id for manual connectors
  const positionsById = {};
  const tracksWithCoords = trackLayouts.map((trackLayout) => {
    const cols = {};
    trackLayout.nodes.forEach(node => {
      const cIdx = RANK_COL[node.rank] ?? 0;
      if (!cols[cIdx]) cols[cIdx] = [];
      cols[cIdx].push(node);
    });

    const nodesWithCoords = [];
    Object.keys(cols).forEach(cIdx => {
      const stack = cols[cIdx];
      const N = stack.length;
      const stackHeight = N * NODE_H + (N - 1) * 12;
      const startY = trackLayout.y + (trackLayout.height - stackHeight) / 2;
      stack.forEach((node, i) => {
        const defaultX = LEFT_GUTTER + Number(cIdx) * COL_W;
        const offset = nodePositions[node.id] || { dx: 0, dy: 0 };
        const coord = { node, x: defaultX + offset.dx, y: startY + i * (NODE_H + 12) + offset.dy, colIdx: Number(cIdx) };
        nodesWithCoords.push(coord);
        positionsById[node.id] = coord;
      });
    });

    return { ...trackLayout, nodesWithCoords, cols };
  });

  // ORG LEAD sits to the right of the final column, vertically centered on the core lane
  const orgLeadOffset = nodePositions[ORG_LEAD_NODE.id] || { dx: 0, dy: 0 };
  const coreLayout = tracksWithCoords.find(t => t.id === 'core');
  const orgLeadCoord = {
    node: ORG_LEAD_NODE,
    x: LEFT_GUTTER + totalCols * COL_W + 30 + orgLeadOffset.dx,
    y: (coreLayout ? coreLayout.y + coreLayout.height / 2 - NODE_H / 2 : HEADER_H) + orgLeadOffset.dy,
  };
  positionsById[ORG_LEAD_NODE.id] = orgLeadCoord;

  const manualConnectorPaths = MANUAL_CONNECTORS.map(({ from, to, label }) => {
    const a = positionsById[from];
    const b = positionsById[to];
    if (!a || !b) return null;
    const w = COL_W - 16;
    const x1 = a.x + w;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_H / 2;
    const dx = Math.max(40, x2 - x1);
    const midX = x1 + dx / 2;
    const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 5} ${y2}`;
    const s = nodeStyle(a.node.color);
    return { key: `${from}-${to}`, pathD, s, label, midX, midY: (y1 + y2) / 2, x1, y1, x2, y2 };
  }).filter(Boolean);

  return (
    <div className="w-full rounded-[2rem] border border-lime-300/10 overflow-hidden select-none"
      style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.03) 0%,rgba(2,6,3,0.95) 60%)' }}>

      {/* ── Header bar ─────────────────────────────────────── */}
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
            { color: YELLOW, label: 'Flight / Core' },
            { color: RED, label: 'Combat / Ops' },
            { color: SILVER, label: 'Non-Polaris' },
            { color: GREEN, label: 'Leadership' },
            { color: PURPLE, label: 'Discord' },
            { color: BLUE, label: 'Website' },
          ].map(({ color, label }) => {
            const s = nodeStyle(color);
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm border" style={{ background: s.bg, borderColor: s.border }} />
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: s.text }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SVG Chart ──────────────────────────────────────── */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '75vh' }}>
        <svg
          ref={svgRef}
          width={chartW}
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          onMouseMove={isAdmin ? handleMouseMove : undefined}
          onMouseUp={isAdmin ? handleMouseUp : undefined}
          onMouseLeave={isAdmin ? handleMouseUp : undefined}
          onTouchMove={isAdmin ? handleMouseMove : undefined}
          onTouchEnd={isAdmin ? handleMouseUp : undefined}
          style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="scanlines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
              <rect x="0" y="3" width="1" height="1" fill="black" />
            </pattern>
          </defs>

          {/* ── Top-left legend stack: Discord / Website Ranks / Rank Level ── */}
          {[
            { label: 'DISCORD', color: PURPLE },
            { label: 'WEBSITE RANKS', color: BLUE },
            { label: 'RANK LEVEL', color: ORANGE },
          ].map((box, i) => {
            const s = nodeStyle(box.color);
            return (
              <g key={box.label} transform={`translate(4, ${i * 30})`}>
                <rect width={138} height={26} rx={4} fill={s.bg} stroke={s.border} strokeWidth={1} />
                <text x={69} y={17} textAnchor="middle" fontSize={8.5} fontFamily="'JetBrains Mono', monospace" fontWeight={800} fill={s.text} letterSpacing={0.5}>{box.label}</text>
              </g>
            );
          })}

          {/* ── Top-right: Server Owner / Colonel ── */}
          {['Server owner', 'COLONEL'].map((label, i) => (
            <g key={label} transform={`translate(${chartW - 142}, ${i * 30})`}>
              <rect width={138} height={26} rx={4} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <text x={69} y={17} textAnchor="middle" fontSize={8.5} fontFamily="'JetBrains Mono', monospace" fontWeight={800} fill="rgba(255,255,255,0.6)" letterSpacing={0.5}>{label}</text>
            </g>
          ))}

          {/* ── Rank column headers ── */}
          {RANK_SCALE.map((r, ci) => {
            const cx = LEFT_GUTTER + ci * COL_W + (COL_W - 16) / 2;
            const sparse = SPARSE_HEADER.find(sh => sh.col === r.code);
            return (
              <g key={r.code}>
                <line x1={cx} y1={HEADER_H - 8} x2={cx} y2={chartH - 20} stroke="#ffffff08" strokeWidth={1} strokeDasharray="3 6" />

                {sparse && (
                  <g>
                    <rect x={LEFT_GUTTER + ci * COL_W} y={0} width={COL_W - 16} height={22} rx={4} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <text x={cx} y={15} textAnchor="middle" fontSize={8} fontFamily="'JetBrains Mono', monospace" fontWeight={800} fill="rgba(255,255,255,0.4)" letterSpacing={0.4}>{sparse.label}</text>
                  </g>
                )}

                <rect x={LEFT_GUTTER + ci * COL_W} y={30} width={COL_W - 16} height={46} rx={6} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                <text x={cx} y={49} textAnchor="middle" fontSize={11.5} fontFamily="'JetBrains Mono', monospace" fontWeight={900} fill="rgba(255,255,255,0.65)" letterSpacing={1}>{r.code}</text>
                <text x={cx} y={65} textAnchor="middle" fontSize={8.5} fontFamily="'JetBrains Mono', monospace" fontWeight={700} fill="rgba(255,255,255,0.35)" letterSpacing={0.5}>{r.label}</text>
              </g>
            );
          })}

          {/* ── Lane rows ── */}
          {tracksWithCoords.map((trackLayout) => {
            const sortedColIndices = Object.keys(trackLayout.cols).map(Number).sort((a, b) => a - b);
            const connectors = [];
            for (let i = 0; i < sortedColIndices.length - 1; i++) {
              const currentCols = trackLayout.nodesWithCoords.filter(n => n.colIdx === sortedColIndices[i]);
              const nextCols = trackLayout.nodesWithCoords.filter(n => n.colIdx === sortedColIndices[i + 1]);
              currentCols.forEach(item => {
                nextCols.forEach(nextItem => {
                  const x1 = item.x + (COL_W - 16);
                  const y1 = item.y + NODE_H / 2;
                  const x2 = nextItem.x;
                  const y2 = nextItem.y + NODE_H / 2;
                  const s = nodeStyle(item.node.color);
                  const dx = Math.max(40, x2 - x1);
                  const midX = x1 + dx / 2;
                  const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 5} ${y2}`;
                  connectors.push(
                    <g key={`connector-${trackLayout.id}-${item.node.id}-${nextItem.node.id}`}>
                      <path d={pathD} stroke={s.border} strokeWidth={1.5} fill="none" opacity={0.45} strokeDasharray="4 3" />
                      <polygon points={`${x2 - 1},${y2} ${x2 - 6},${y2 - 3} ${x2 - 6},${y2 + 3}`} fill={s.border} opacity={0.6} />
                    </g>
                  );
                });
              });
            }

            return (
              <g key={trackLayout.id}>
                <rect x={4} y={trackLayout.y + 2} width={138} height={trackLayout.height - 4} rx={6} fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.1)" strokeWidth={1} />
                <text x={9} y={trackLayout.y + trackLayout.height / 2 - 2} fontSize={15} fontFamily="sans-serif" fill="rgba(255,255,255,0.5)">{trackLayout.icon}</text>
                <text x={30} y={trackLayout.y + trackLayout.height / 2 + 3} fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={900} fill="rgba(255,255,255,0.5)" letterSpacing={1}>{trackLayout.label}</text>

                {connectors}

                {trackLayout.nodesWithCoords.map(({ node, x, y }) => (
                  <OrgNode
                    key={node.id}
                    node={node}
                    x={x}
                    y={y}
                    isAdmin={isAdmin}
                    isDragging={activeDrag?.nodeId === node.id}
                    onMouseDown={isAdmin ? (e) => handleMouseDown(e, node.id) : undefined}
                    onTouchStart={isAdmin ? (e) => handleMouseDown(e, node.id) : undefined}
                  />
                ))}
              </g>
            );
          })}

          {/* ── Manual cross-lane connectors (decision gate, merges, ORG LEAD hand-off) ── */}
          {manualConnectorPaths.map(({ key, pathD, s, label, midX, midY }) => (
            <g key={`manual-${key}`}>
              <path d={pathD} stroke={label === 'No' ? '#fe7070' : s.border} strokeWidth={label ? 2 : 1.5} fill="none" opacity={0.7} strokeDasharray={label ? 'none' : '4 3'} />
              {label && (
                <text x={midX} y={midY - 8} textAnchor="middle" fontSize={9.5} fontFamily="'JetBrains Mono', monospace" fontWeight={800} fill={label === 'No' ? '#fe7070' : '#00ff41'} letterSpacing={0.5}>{label}</text>
              )}
            </g>
          ))}

          {/* ── ORG LEAD (final node) ── */}
          <OrgNode
            node={orgLeadCoord.node}
            x={orgLeadCoord.x}
            y={orgLeadCoord.y}
            isAdmin={isAdmin}
            isDragging={activeDrag?.nodeId === ORG_LEAD_NODE.id}
            onMouseDown={isAdmin ? (e) => handleMouseDown(e, ORG_LEAD_NODE.id) : undefined}
            onTouchStart={isAdmin ? (e) => handleMouseDown(e, ORG_LEAD_NODE.id) : undefined}
          />

          <rect x={0} y={0} width={chartW} height={chartH} fill="url(#scanlines)" opacity={0.04} pointerEvents="none" />
        </svg>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-6 py-2 border-t border-white/5 flex flex-wrap items-center gap-6 text-[8px] font-mono font-black uppercase tracking-widest text-white/15">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: YELLOW }} />Flight / Core</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: RED }} />Combat / Ops</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: SILVER }} />Non-Polaris</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />Leadership</span>
        <span className="ml-auto opacity-50">
          {isAdmin ? 'Drag nodes to customize position · hover nodes for requirements' : 'hover nodes for requirements'}
        </span>
      </div>
    </div>
  );
};

export default RanksRolesChart;