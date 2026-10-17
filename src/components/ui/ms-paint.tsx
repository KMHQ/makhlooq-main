"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Save, Trash2, Eraser, Paintbrush, Monitor, Maximize2, Download, MousePointer2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MSpaintProps {
    width?: number | string;
    height?: number | string;
    canvasWidth?: number;
    canvasHeight?: number;
    colorPalette?: string[];
    title?: string;
    menuItems?: string[];
    className?: string;
    style?: React.CSSProperties;
    onSave?: (canvas: HTMLCanvasElement) => void;
    brushSize?: number;
    eraseSize?: number;
}

const DEFAULT_COLORS = [
    "#000000",
    "#424242",
    "#757575",
    "#bdbdbd",
    "#ffffff",
    "#ef5350",
    "#f48fb1",
    "#ce93d8",
    "#90caf9",
    "#81c784",
    "#fff176",
    "#ffb74d",
    "#ff8a65",
    "#a1887f",
    "#90a4ae",
];

export const MSpaint: React.FC<MSpaintProps> = ({
    width = 800,
    height = 500,
    canvasWidth = 1200,
    canvasHeight = 800,
    colorPalette = DEFAULT_COLORS,
    title = "Untitled - Paint",
    menuItems = ["File", "Edit", "View", "Image", "Options", "Help"],
    className = "",
    style = {},
    onSave,
    brushSize = 4,
    eraseSize = 24,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });
    const lastSyncRef = useRef<number>(0);
    const channelRef = useRef<any>(null);
    const rectRef = useRef<DOMRect | null>(null);
    const lastBroadcastRef = useRef(0);
    const pointsQueueRef = useRef<{ from: { x: number; y: number }; to: { x: number; y: number }; pressure: number }[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    const [tool, setTool] = useState<"brush" | "eraser">("brush");
    const [color, setColor] = useState(colorPalette[0]);
    const [currentBrushSize, setCurrentBrushSize] = useState(brushSize);
    const [currentEraseSize, setCurrentEraseSize] = useState(eraseSize);
    const [status, setStatus] = useState("Ready");
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(1);

    const getContext = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        // Optimization: desynchronized for low latency, alpha: false if not needed
        const ctx = canvas.getContext("2d", {
            alpha: false,
            desynchronized: true,
        });
        if (!ctx) return null;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        return ctx;
    }, []);

    // Initialize canvas and handle Realtime sync
    useEffect(() => {
        const ctx = getContext();
        if (ctx && canvasRef.current) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const loadState = async () => {
                const { data } = await (supabase as any)
                    .from("team_whiteboard")
                    .select("state")
                    .eq("id", "team_mspaint_last_drawing")
                    .single();
                if (data?.state) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => ctx.drawImage(img, 0, 0);
                    img.src = data.state;
                }
            };

            loadState();

            // REALTIME BROADCAST & CHANGES
            const channel = (supabase as any).channel("whiteboard_realtime", {
                config: { broadcast: { self: false } },
            });
            channelRef.current = channel;

            channel
                .on("broadcast", { event: "stroke" }, ({ payload }: any) => {
                    const { from, to, color: strokeColor, width: strokeWidth, tool: strokeTool, clear } = payload;
                    const remoteCtx = getContext();
                    if (!remoteCtx) return;

                    if (clear) {
                        remoteCtx.fillStyle = "#ffffff";
                        remoteCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                        return;
                    }

                    remoteCtx.lineCap = "round";
                    remoteCtx.lineJoin = "round";
                    remoteCtx.lineWidth = strokeWidth;
                    remoteCtx.strokeStyle = strokeTool === "eraser" ? "#ffffff" : strokeColor;

                    remoteCtx.beginPath();
                    remoteCtx.moveTo(from.x, from.y);
                    remoteCtx.lineTo(to.x, to.y);
                    remoteCtx.stroke();
                })
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "team_whiteboard", filter: "id=eq.team_mspaint_last_drawing" },
                    (payload: any) => {
                        if (payload.new.state && !drawingRef.current) {
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.onload = () => ctx.drawImage(img, 0, 0);
                            img.src = payload.new.state;
                        }
                    },
                )
                .subscribe();

            return () => {
                (supabase as any).removeChannel(channel);
            };
        }
    }, [canvasHeight, canvasWidth, getContext]);

    const getPointerPosition = useCallback(
        (event: React.PointerEvent<HTMLCanvasElement>) => {
            const rect = rectRef.current;
            if (!rect) return { x: 0, y: 0 };
            return {
                x: (event.clientX - rect.left) / zoom,
                y: (event.clientY - rect.top) / zoom,
            };
        },
        [zoom],
    );

    const renderStroke = useCallback(() => {
        const ctx = getContext();
        if (!ctx) return;

        const baseWidth = tool === "eraser" ? currentEraseSize : currentBrushSize;
        const finalColor = tool === "eraser" ? "#ffffff" : color;

        ctx.strokeStyle = finalColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        while (pointsQueueRef.current.length > 0) {
            const point = pointsQueueRef.current.shift();
            if (!point) continue;

            const finalWidth = baseWidth * (0.5 + point.pressure * 0.5);
            ctx.lineWidth = finalWidth;

            ctx.beginPath();
            ctx.moveTo(point.from.x, point.from.y);
            ctx.lineTo(point.to.x, point.to.y);
            ctx.stroke();

            // Throttled Broadcast
            const now = performance.now();
            if (channelRef.current && now - lastBroadcastRef.current > 24) {
                // ~40fps broadcast is usually enough
                lastBroadcastRef.current = now;
                channelRef.current.send({
                    type: "broadcast",
                    event: "stroke",
                    payload: { from: point.from, to: point.to, color: finalColor, width: finalWidth, tool },
                });
            }
        }
        animationFrameRef.current = null;
    }, [color, currentBrushSize, currentEraseSize, getContext, tool]);

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (event.button !== undefined && event.button !== 0) return;

        // Cache rect to avoid layout thrashing
        rectRef.current = event.currentTarget.getBoundingClientRect();

        drawingRef.current = true;
        lastPointRef.current = getPointerPosition(event);
        event.currentTarget.setPointerCapture(event.pointerId);

        if (status !== "Drawing...") setStatus(tool === "eraser" ? "Erasing..." : "Drawing...");

        const pos = getPointerPosition(event);
        pointsQueueRef.current.push({ from: pos, to: pos, pressure: event.pressure || 1 });
        if (!animationFrameRef.current) animationFrameRef.current = requestAnimationFrame(renderStroke);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const nextPoint = getPointerPosition(event);

        pointsQueueRef.current.push({
            from: lastPointRef.current,
            to: nextPoint,
            pressure: event.pressure || 1,
        });

        lastPointRef.current = nextPoint;

        if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(renderStroke);
        }
    };

    const stopDrawing = () => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        setStatus("Ready");

        // Autosave to Supabase after drawing session ends
        save();
    };

    const clearCanvas = () => {
        const ctx = getContext();
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        setStatus("Canvas Cleared");
        setTimeout(() => setStatus("Ready"), 2000);

        // Broadcast clear event
        if (channelRef.current) {
            channelRef.current.send({
                type: "broadcast",
                event: "stroke",
                payload: { clear: true },
            });
        }

        save();
    };

    const syncingRef = useRef(false);

    const save = async (isManual = false) => {
        const isAuto = isManual !== true;
        const canvas = canvasRef.current;
        if (!canvas || isSaving || syncingRef.current) return;

        if (!isAuto) {
            setIsSaving(true);
            setStatus("Saving...");
        }
        syncingRef.current = true;

        try {
            // Use toBlob instead of toDataURL for better performance
            canvas.toBlob(
                async (blob) => {
                    if (!blob) throw new Error("Blob creation failed");

                    // In a real production app, we'd upload the blob to Supabase Storage.
                    // For this demo context, we'll convert to Base64 only for the final save
                    // as the schema expects a 'state' string.
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        const { error } = await (supabase as any).from("team_whiteboard").upsert({
                            id: "team_mspaint_last_drawing",
                            state: base64data,
                            updated_at: new Date().toISOString(),
                        });
                        if (error) throw error;
                        if (onSave && !isAuto) onSave(canvas);
                        if (!isAuto) setStatus("Saved Successfully");
                    };
                    reader.readAsDataURL(blob);
                },
                "image/webp",
                0.8,
            );
        } catch (err) {
            console.error("Save failed:", err);
            if (!isAuto) setStatus("Save Failed");
        } finally {
            syncingRef.current = false;
            if (!isAuto) {
                setIsSaving(false);
                setTimeout(() => setStatus("Ready"), 2000);
            }
        }
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `khalai-drawing-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        setStatus("Downloaded");
        setTimeout(() => setStatus("Ready"), 2000);
    };

    return (
        <div
            className={`relative flex flex-col border border-white/10 bg-[#262626] text-white/90 shadow-2xl overflow-hidden rounded-xl font-sans ${className}`}
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
                ...style,
            }}
        >
            {/* Window Header - Modern Neutral */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 select-none">
                <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-white/40" />
                    <span className="text-[12px] font-medium tracking-wide truncate max-w-[200px]">{title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/5" />
                    <div className="w-3 h-3 rounded-full bg-white/5" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
            </div>

            {/* Menu Bar */}
            <div className="flex items-center gap-5 px-4 py-1.5 border-b border-white/5 text-[11px] font-medium text-white/40 select-none bg-white/[0.02]">
                {menuItems.map((item) => (
                    <button key={item} className="hover:text-white transition-colors cursor-default">
                        {item}
                    </button>
                ))}
            </div>

            {/* Main UI Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Toolbox */}
                <div className="w-14 border-r border-white/5 bg-white/[0.03] flex flex-col items-center py-5 gap-5">
                    <button
                        onClick={() => setTool("brush")}
                        className={`p-2.5 rounded-lg transition-all ${tool === "brush" ? "bg-white text-black" : "text-white/40 hover:bg-white/5"}`}
                        title="Brush"
                    >
                        <Paintbrush size={20} />
                    </button>
                    <button
                        onClick={() => setTool("eraser")}
                        className={`p-2.5 rounded-lg transition-all ${tool === "eraser" ? "bg-white text-black" : "text-white/40 hover:bg-white/5"}`}
                        title="Eraser"
                    >
                        <Eraser size={20} />
                    </button>

                    <div className="w-8 h-px bg-white/10 my-1" />

                    <button
                        onClick={clearCanvas}
                        className="p-2.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Clear"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={() => save(true)}
                        className="p-2.5 text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        title="Save"
                    >
                        <Save size={20} />
                    </button>
                    <button
                        onClick={downloadImage}
                        className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Download"
                    >
                        <Download size={20} />
                    </button>

                    <div className="mt-auto flex flex-col items-center gap-3 pb-4">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Size</span>
                        <div className="flex flex-col-reverse gap-2">
                            {[2, 4, 12, 24].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => (tool === "brush" ? setCurrentBrushSize(s) : setCurrentEraseSize(s))}
                                    className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all ${(tool === "brush" ? currentBrushSize : currentEraseSize) === s ? "border-white bg-white/10" : "border-transparent text-white/20 hover:text-white/40"}`}
                                >
                                    <div
                                        className="rounded-full bg-current"
                                        style={{ width: `${Math.max(2, s / 3)}px`, height: `${Math.max(2, s / 3)}px` }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div ref={viewportRef} className="flex-1 relative overflow-auto bg-[#1a1a1a] custom-scrollbar">
                    <div className="relative shadow-2xl mx-auto flex items-center justify-center p-10 min-w-full min-h-full">
                        <div
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: "top left",
                                willChange: "transform",
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={canvasWidth}
                                height={canvasHeight}
                                className="bg-white"
                                style={{
                                    cursor: tool === "eraser" ? "crosshair" : "default",
                                    touchAction: "none",
                                    width: `${canvasWidth}px`,
                                    height: `${canvasHeight}px`,
                                    boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
                                    imageRendering: "auto",
                                    willChange: "transform",
                                }}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={stopDrawing}
                                onPointerLeave={stopDrawing}
                            />
                        </div>
                    </div>
                </div>

                {/* Color Palette (Vertical Right) */}
                <div className="w-16 border-l border-white/5 bg-white/[0.03] p-3 flex flex-col gap-2.5 overflow-y-auto custom-scrollbar">
                    <span className="text-[9px] font-bold text-center text-white/20 uppercase tracking-widest mb-1">Colors</span>
                    {colorPalette.map((c) => (
                        <button
                            key={c}
                            onClick={() => {
                                setColor(c);
                                setTool("brush");
                            }}
                            className={`w-full aspect-square rounded-lg border-2 transition-all active:scale-90 ${color === c && tool === "brush" ? "border-white scale-110 shadow-lg" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="mt-auto pt-4 border-t border-white/5 flex flex-col items-center gap-3">
                        <button
                            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                        >
                            +
                        </button>
                        <span className="text-[10px] font-bold text-white/40">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
                        >
                            -
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-4 text-[10px] font-medium text-white/30 select-none">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.includes("Failed") ? "bg-red-500" : "bg-green-500"}`} />
                        <span>{status}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="uppercase tracking-wider">Tool: {tool}</span>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm border border-white/10" style={{ background: color }} />
                        <span className="uppercase tracking-wider">{color}</span>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <span>
                            {canvasWidth} × {canvasHeight} px
                        </span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="opacity-40">v2.1.0</span>
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
};
