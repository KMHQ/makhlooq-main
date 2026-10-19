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
        <div className="bg-[#050b08]/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative w-full min-h-[90vh]">
            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between bg-[#0a1a12]/50 z-10 relative">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Scan size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Career Progression & Roles</h2>
                        <p className="text-emerald-400/60 text-xs font-mono uppercase tracking-widest mt-0.5">
                            Khalai Makhlooq Architecture
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Image Viewer Area with Floating Controls ── */}
            <div className="flex-1 relative min-h-[750px] overflow-hidden bg-[#020504]">
                {/* Floating Toolbar inside the Chart Container */}
                <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-3">
                    {/* Directional Move Buttons */}
                    <div className="flex items-center gap-1 bg-[#050b08]/90 border border-emerald-500/30 rounded-xl p-1.5 backdrop-blur-md shadow-lg">
                        <span className="text-[10px] font-mono uppercase text-emerald-400/60 px-1.5 select-none font-bold">Move</span>
                        <button
                            onClick={() => handleMove("left")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors"
                            title="Move Left"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => handleMove("up")}
                                className="w-7 h-3.5 rounded flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors"
                                title="Move Up"
                            >
                                <ChevronUp size={12} />
                            </button>
                            <button
                                onClick={() => handleMove("down")}
                                className="w-7 h-3.5 rounded flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors"
                                title="Move Down"
                            >
                                <ChevronDown size={12} />
                            </button>
                        </div>
                        <button
                            onClick={() => handleMove("right")}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors"
                            title="Move Right"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Zoom & Display Controls */}
                    <div className="flex items-center gap-1.5 bg-[#050b08]/90 border border-emerald-500/30 rounded-xl p-1.5 backdrop-blur-md shadow-lg">
                        <button
                            onClick={handleZoomOut}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <div className="w-14 text-center text-xs font-mono text-emerald-400 select-none font-bold">
                            {fitMode === "natural" ? "FULL" : fitMode === "width" ? "FIT W" : `${Math.round(scale * 100)}%`}
                        </div>
                        <button
                            onClick={handleZoomIn}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn size={16} />
                        </button>

                        <div className="w-px h-4 bg-emerald-500/20 mx-0.5" />

                        {/* View Mode Presets */}
                        <button
                            onClick={() => handleFitModeChange("natural")}
                            className={`px-2.5 h-8 rounded-lg flex items-center gap-1 text-xs font-mono font-semibold transition-colors ${
                                fitMode === "natural"
                                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                    : "text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title="Full Natural View"
                        >
                            <Maximize size={13} />
                            <span>FULL</span>
                        </button>

                        <button
                            onClick={() => handleFitModeChange("width")}
                            className={`px-2.5 h-8 rounded-lg flex items-center gap-1 text-xs font-mono font-semibold transition-colors ${
                                fitMode === "width"
                                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
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
                    className={`w-full h-full min-h-[750px] overflow-auto flex justify-center p-6 ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                >
                    <div
                        className={`transition-all duration-200 ease-out flex justify-center ${
                            fitMode === "width"
                                ? "w-full h-auto"
                                : fitMode === "natural"
                                  ? "w-auto h-auto"
                                  : "p-6 min-w-max min-h-max origin-top"
                        }`}
                        style={fitMode === "custom" ? { transform: `scale(${scale})` } : undefined}
                    >
                        <img
                            src="/KHALAI%20CHARTING.png"
                            alt="Ranks and Roles Chart"
                            className={`shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-xl border border-emerald-500/20 select-none pointer-events-none ${
                                fitMode === "width" ? "w-full h-auto object-contain" : "max-w-none"
                            }`}
                            draggable="false"
                        />
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-3 border-t border-emerald-500/20 flex flex-wrap items-center gap-6 text-[9px] font-mono font-black uppercase tracking-widest text-emerald-400/40 bg-[#0a1a12]/50">
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fcce14]" />
                    Flight / Core
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fe7070]" />
                    Combat / Ops
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#cbc2a3]" />
                    Non-Polaris
                </span>
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#008a0e]" />
                    Leadership
                </span>
                <span className="ml-auto opacity-50">Scroll vertically or drag to view full chart</span>
            </div>
        </div>
    );
};

export default RanksRolesChart;
