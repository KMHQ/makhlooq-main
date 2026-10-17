"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const ROLE_TIER = {
    "quaid - founder": "center",
    "high council": "high",
    advisor: "high",
    kmhq: "small",
};

const NODE_CONFIG = {
    center: { r: 18, ringW: 2.5, glowSize: 44, fontSize: 12, labelOffset: 26 },
    high: { r: 13, ringW: 2, glowSize: 32, fontSize: 11, labelOffset: 20 },
    small: { r: 8, ringW: 1.5, glowSize: 22, fontSize: 10, labelOffset: 14 },
};

const STATUS_META = {
    active: { color: "#22c55e", label: "Active" },
    inactive: { color: "#4b5563", label: "Inactive" },
};

function getTier(member = {}) {
    const icon = (member.flair_icon || "").toLowerCase();
    if (icon === "crown") return "center";
    if (icon === "shield" || icon === "sword" || icon === "terminal") return "high";

    const r = (member.role || "").toLowerCase();
    if (r.includes("founder") || r.includes("quaid")) return "center";
    if (r.includes("council") || r.includes("advisor")) return "high";
    return "small";
}

function initNodes(members, W, H) {
    const cx = W / 2,
        cy = H / 2;
    const n = members.length;
    return members.map((m, i) => {
        const tier = getTier(m);
        const ring = tier === "high" ? Math.min(W, H) * 0.2 : Math.min(W, H) * 0.38;
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        return {
            id: m.id,
            x: cx + ring * Math.cos(angle),
            y: cy + ring * Math.sin(angle),
            vx: 0,
            vy: 0,
            tier,
            member: m,
        };
    });
}

function tickPhysics(nodes, W, H, pinnedId, physics) {
    const cx = W / 2,
        cy = H / 2;
    const { repel, spring, damp } = physics;
    const BOUND = 24;

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i],
                b = nodes[j];
            const dx = a.x - b.x,
                dy = a.y - b.y;
            const dist2 = dx * dx + dy * dy + 1;
            const force = repel / dist2;
            const fx = force * dx,
                fy = force * dy;
            if (a.id !== pinnedId) {
                a.vx += fx;
                a.vy += fy;
            }
            if (b.id !== pinnedId) {
                b.vx -= fx;
                b.vy -= fy;
            }
        }
    }

    nodes.forEach((n) => {
        if (n.id === pinnedId) return;
        const targetR = n.tier === "high" ? Math.min(W, H) * 0.2 : Math.min(W, H) * 0.38;
        const dx = n.x - cx,
            dy = n.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const err = dist - targetR;
        const fx = (dx / dist) * err * spring;
        const fy = (dy / dist) * err * spring;
        n.vx -= fx;
        n.vy -= fy;
        n.vx *= damp;
        n.vy *= damp;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(BOUND, Math.min(W - BOUND, n.x));
        n.y = Math.max(BOUND, Math.min(H - BOUND, n.y));
    });
}

export default function NetworkGraph({ members, onSelect, physics }) {
    const defaultPhysics = { repel: 15000, spring: 0.04, damp: 0.85 };
    const currentPhysics = physics || defaultPhysics;
    const wrapRef = useRef(null);
    const nodesRef = useRef([]);
    const pinnedRef = useRef(null);
    const dragRef = useRef(null);
    const dragOff = useRef({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const physicsRef = useRef(currentPhysics);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        physicsRef.current = currentPhysics;
    }, [currentPhysics]);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const updateSize = () => setSize({ w: el.clientWidth, h: el.clientHeight });
        const ro = new ResizeObserver(updateSize);
        ro.observe(el);
        updateSize();
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!size.w || !size.h) return;
        const existing = new Map(nodesRef.current.map((n) => [n.id, n]));
        nodesRef.current = members.map((m, i) => {
            const prev = existing.get(m.id);
            if (prev) return { ...prev, member: m, tier: getTier(m.role) };
            const fresh = initNodes([m], size.w, size.h)[0];
            return { ...fresh, id: m.id };
        });
    }, [members, size]);

    useEffect(() => {
        let lastFrame = 0;

        const loop = () => {
            const now = performance.now();

            if (size.w && size.h && !document.hidden && now - lastFrame > 50) {
                tickPhysics(nodesRef.current, size.w, size.h, pinnedRef.current, physicsRef.current);
                setFrame((f) => f + 1);
                lastFrame = now;
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [size]);

    const onDown = useCallback((e, id) => {
        e.preventDefault();
        dragRef.current = id;
        pinnedRef.current = id;
        const rect = wrapRef.current.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const node = nodesRef.current.find((n) => n.id === id);
        if (node) dragOff.current = { x: cx - rect.left - node.x, y: cy - rect.top - node.y };
    }, []);

    const onMove = useCallback((e) => {
        if (!dragRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const node = nodesRef.current.find((n) => n.id === dragRef.current);
        if (node) {
            node.x = cx - rect.left - dragOff.current.x;
            node.y = cy - rect.top - dragOff.current.y;
            node.vx = 0;
            node.vy = 0;
        }
    }, []);

    const onUp = useCallback(() => {
        dragRef.current = null;
        pinnedRef.current = null;
    }, []);

    const { w: W, h: H } = size;
    const cx = W / 2,
        cy = H / 2;

    return (
        <div
            ref={wrapRef}
            className="relative w-full h-full select-none overflow-hidden"
            style={{ touchAction: "none", minHeight: 520 }}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onTouchMove={onMove}
            onTouchEnd={onUp}
        >
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <defs>
                    <pattern id="dotg" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                        <circle cx="1.5" cy="1.5" r="1.5" fill="#10b981" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dotg)" />
            </svg>

            <div
                className="absolute pointer-events-none"
                style={{
                    left: cx,
                    top: cy,
                    transform: "translate(-50%,-50%)",
                    width: 400,
                    height: 400,
                    background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
                }}
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    {nodesRef.current.map((n) => (
                        <linearGradient
                            key={`g-${n.id}`}
                            id={`eg-${n.id}`}
                            gradientUnits="userSpaceOnUse"
                            x1={cx}
                            y1={cy}
                            x2={n.x}
                            y2={n.y}
                        >
                            <stop offset="0%" stopColor={n.member?.node_color || "#10b981"} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={n.member?.node_color || "#10b981"} stopOpacity="0.05" />
                        </linearGradient>
                    ))}
                </defs>
                {nodesRef.current.map((n) => (
                    <line
                        key={`e-${n.id}`}
                        x1={cx}
                        y1={cy}
                        x2={n.x}
                        y2={n.y}
                        stroke={`url(#eg-${n.id})`}
                        strokeWidth={n.tier === "high" ? 1.5 : 0.8}
                    />
                ))}
            </svg>

            {W > 0 && (
                <div
                    className="absolute z-20 flex flex-col items-center pointer-events-none"
                    style={{ left: cx, top: cy, transform: "translate(-50%,-50%)" }}
                >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400/80 shadow-2xl">
                        <img src="/logo.png" alt="KM Fleet" className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-2 text-[9px] tracking-[0.25em] text-emerald-400/80 uppercase font-semibold">KM Fleet</span>
                </div>
            )}

            {nodesRef.current.map((node) => {
                const { x, y, id, tier, member } = node;
                if (!member) return null;
                const cfg = NODE_CONFIG[tier];
                const color = member.node_color || "#10b981";
                const isDragging = dragRef.current === id;

                return (
                    <div
                        key={id}
                        className="absolute group flex flex-col items-center"
                        style={{
                            left: x,
                            top: y,
                            transform: "translate(-50%,-50%)",
                            zIndex: isDragging ? 50 : 10,
                            cursor: isDragging ? "grabbing" : "grab",
                        }}
                        onMouseDown={(e) => onDown(e, id)}
                        onTouchStart={(e) => onDown(e, id)}
                        onClick={() => !isDragging && onSelect(member)}
                    >
                        <div
                            className="absolute rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                width: cfg.glowSize * 1.5,
                                height: cfg.glowSize * 1.5,
                                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%,-50%)",
                            }}
                        />

                        {member.avatar_url ? (
                            <div
                                className="rounded-full overflow-hidden border-2 transition-transform duration-200 group-hover:scale-110"
                                style={{ width: cfg.r * 2, height: cfg.r * 2, borderColor: color, boxShadow: `0 0 12px ${color}44` }}
                            >
                                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div
                                className="rounded-full transition-transform duration-200 group-hover:scale-125 flex items-center justify-center font-bold"
                                style={{
                                    width: cfg.r * 2,
                                    height: cfg.r * 2,
                                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                    color: "#040806",
                                    fontSize: cfg.r * 0.8,
                                }}
                            >
                                {member.name?.[0]?.toUpperCase()}
                            </div>
                        )}

                        <div className="mt-1.5 text-center pointer-events-none max-w-[80px]">
                            <div
                                className="text-gray-400 group-hover:text-white transition-colors truncate font-medium"
                                style={{ fontSize: cfg.fontSize }}
                            >
                                {member.name}
                            </div>
                            <div className="uppercase tracking-wider opacity-50 truncate" style={{ fontSize: cfg.fontSize - 2, color }}>
                                {member.role}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
