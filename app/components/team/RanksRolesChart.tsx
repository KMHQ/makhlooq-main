"use client";

import { useState, useRef, useEffect, type MouseEvent } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Maximize, Scan, ZoomIn, ZoomOut } from "lucide-react";

type FitMode = "natural" | "width" | "custom";
type Direction = "up" | "down" | "left" | "right";

const RanksRolesChart = () => {
    const [scale, setScale] = useState(1);
    const [fitMode, setFitMode] = useState<FitMode>("natural");
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const handleZoomIn = () => {
        setFitMode("custom");
        setScale((s) => Math.min(s + 0.25, 3));
    };

    const handleZoomOut = () => {
        setFitMode("custom");
        setScale((s) => Math.max(s - 0.25, 0.25));
    };

    const handleFitModeChange = (mode: FitMode) => {
        setFitMode(mode);
        setScale(1);
        if (containerRef.current) {
            containerRef.current.scrollLeft = 0;
            containerRef.current.scrollTop = 0;
        }
    };

    const handleMove = (direction: Direction) => {
        if (!containerRef.current) return;
        const step = 300;
        if (direction === "up") containerRef.current.scrollTop -= step;
        if (direction === "down") containerRef.current.scrollTop += step;
        if (direction === "left") containerRef.current.scrollLeft -= step;
        if (direction === "right") containerRef.current.scrollLeft += step;
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || (e.target as HTMLElement).closest("button")) return;
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: containerRef.current.scrollLeft,
            scrollTop: containerRef.current.scrollTop,
        };
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        containerRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
        containerRef.current.scrollTop = dragStart.current.scrollTop - dy;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div className="relative flex min-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#050b08]/80 shadow-2xl backdrop-blur-xl">
            {/* ── Header ── */}
            <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/20 bg-[#0a1a12]/50 px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                        <Scan size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-wide text-white">Career Progression & Roles</h2>
                        <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-emerald-400/60">
                            Khalai Makhlooq Architecture
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Image Viewer Area with Floating Controls ── */}
            <div className="relative min-h-[750px] flex-1 overflow-hidden bg-[#020504]">
                {/* Floating Toolbar inside the Chart Container */}
                <div className="absolute right-4 top-4 z-20 flex flex-wrap items-center gap-3">
                    {/* Directional Move Buttons */}
                    <div className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-[#050b08]/90 p-1.5 shadow-lg backdrop-blur-md">
                        <span className="select-none px-1.5 font-mono text-[10px] font-bold uppercase text-emerald-400/60">Move</span>
                        <button
                            onClick={() => handleMove("left")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                            title="Move Left"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => handleMove("up")}
                                className="flex h-3.5 w-7 items-center justify-center rounded text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                                title="Move Up"
                            >
                                <ChevronUp size={12} />
                            </button>
                            <button
                                onClick={() => handleMove("down")}
                                className="flex h-3.5 w-7 items-center justify-center rounded text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                                title="Move Down"
                            >
                                <ChevronDown size={12} />
                            </button>
                        </div>
                        <button
                            onClick={() => handleMove("right")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                            title="Move Right"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Zoom & Display Controls */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-[#050b08]/90 p-1.5 shadow-lg backdrop-blur-md">
                        <button
                            onClick={handleZoomOut}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/20"
                            title="Zoom Out"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <div className="w-14 select-none text-center font-mono text-xs font-bold text-emerald-400">
                            {fitMode === "natural" ? "FULL" : fitMode === "width" ? "FIT W" : `${Math.round(scale * 100)}%`}
                        </div>
                        <button
                            onClick={handleZoomIn}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/20"
                            title="Zoom In"
                        >
                            <ZoomIn size={16} />
                        </button>

                        <div className="mx-0.5 h-4 w-px bg-emerald-500/20" />

                        {/* View Mode Presets */}
                        <button
                            onClick={() => handleFitModeChange("natural")}
                            className={`flex h-8 items-center gap-1 rounded-lg px-2.5 font-mono text-xs font-semibold transition-colors ${
                                fitMode === "natural"
                                    ? "border border-emerald-500/40 bg-emerald-500/30 text-emerald-300"
                                    : "text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title="Full Natural View"
                        >
                            <Maximize size={13} />
                            <span>FULL</span>
                        </button>

                        <button
                            onClick={() => handleFitModeChange("width")}
                            className={`flex h-8 items-center gap-1 rounded-lg px-2.5 font-mono text-xs font-semibold transition-colors ${
                                fitMode === "width"
                                    ? "border border-emerald-500/40 bg-emerald-500/30 text-emerald-300"
                                    : "text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title="Fit Width"
                        >
                            <span>FIT W</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable / Draggable Container */}
                <div
                    ref={containerRef}
                    className={`flex h-full min-h-[750px] w-full justify-center overflow-auto p-6 ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                >
                    <div
                        className={`flex justify-center transition-all duration-200 ease-out ${
                            fitMode === "width"
                                ? "h-auto w-full"
                                : fitMode === "natural"
                                  ? "h-auto w-auto"
                                  : "min-h-max min-w-max origin-top p-6"
                        }`}
                        style={fitMode === "custom" ? { transform: `scale(${scale})` } : undefined}
                    >
                        <img
                            src="/KHALAI%20CHARTING.png"
                            alt="Ranks and Roles Chart"
                            className={`pointer-events-none select-none rounded-xl border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] ${
                                fitMode === "width" ? "h-auto w-full object-contain" : "max-w-none"
                            }`}
                            draggable="false"
                        />
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex flex-wrap items-center gap-6 border-t border-emerald-500/20 bg-[#0a1a12]/50 px-6 py-3 font-mono text-[9px] font-black uppercase tracking-widest text-emerald-400/40">
                <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#fcce14]" />
                    Flight / Core
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#fe7070]" />
                    Combat / Ops
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#cbc2a3]" />
                    Non-Polaris
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#008a0e]" />
                    Leadership
                </span>
                <span className="ml-auto opacity-50">Scroll vertically or drag to view full chart</span>
            </div>
        </div>
    );
};

export default RanksRolesChart;
