"use client";

import { useState, useEffect, useRef, type ChangeEvent, type MouseEvent, type SyntheticEvent, type TouchEvent } from "react";
import { motion } from "motion/react";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

interface AvatarCropperModalProps {
    imageUrl: string;
    onCrop: (blob: Blob | null) => void;
    onClose: () => void;
}

export default function AvatarCropperModal({ imageUrl, onCrop, onClose }: AvatarCropperModalProps) {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [baseWidth, setBaseWidth] = useState(0);
    const [baseHeight, setBaseHeight] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const cropSize = 240;

    const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (!naturalWidth || !naturalHeight) return;

        let w = cropSize;
        let h = cropSize;

        if (naturalWidth > naturalHeight) {
            w = cropSize * (naturalWidth / naturalHeight);
        } else {
            h = cropSize * (naturalHeight / naturalWidth);
        }

        setBaseWidth(w);
        setBaseHeight(h);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setLoading(false);
    };

    const clampOffset = (x: number, y: number, currentZoom: number) => {
        const w = baseWidth * currentZoom;
        const h = baseHeight * currentZoom;
        const maxDragX = Math.max(0, (w - cropSize) / 2);
        const maxDragY = Math.max(0, (h - cropSize) / 2);
        return {
            x: Math.min(Math.max(x, -maxDragX), maxDragX),
            y: Math.min(Math.max(y, -maxDragY), maxDragY),
        };
    };

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        };
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.touches[0].clientX - offset.x,
            y: e.touches[0].clientY - offset.y,
        };
    };

    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
                const newX = e.clientX - dragStartRef.current.x;
                const newY = e.clientY - dragStartRef.current.y;
                setOffset(clampOffset(newX, newY, zoom));
            };

            const handleGlobalTouchMove = (e: globalThis.TouchEvent) => {
                if (e.touches.length !== 1) return;
                const newX = e.touches[0].clientX - dragStartRef.current.x;
                const newY = e.touches[0].clientY - dragStartRef.current.y;
                setOffset(clampOffset(newX, newY, zoom));
            };

            const handleGlobalMouseUp = () => {
                setIsDragging(false);
            };

            window.addEventListener("mousemove", handleGlobalMouseMove);
            window.addEventListener("mouseup", handleGlobalMouseUp);
            window.addEventListener("touchmove", handleGlobalTouchMove);
            window.addEventListener("touchend", handleGlobalMouseUp);

            return () => {
                window.removeEventListener("mousemove", handleGlobalMouseMove);
                window.removeEventListener("mouseup", handleGlobalMouseUp);
                window.removeEventListener("touchmove", handleGlobalTouchMove);
                window.removeEventListener("touchend", handleGlobalMouseUp);
            };
        }
    }, [isDragging, zoom, baseWidth, baseHeight]);

    const handleZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newZoom = parseFloat(e.target.value);
        setZoom(newZoom);
        setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
    };

    const handleCrop = () => {
        if (!imageRef.current || !baseWidth || !baseHeight) return;

        const img = imageRef.current;
        const w = baseWidth * zoom;
        const h = baseHeight * zoom;

        // Calculate scale factor from natural image to viewport size
        const scale = w / img.naturalWidth;

        // Calculate crop coordinates relative to the scaled image
        const cropLeftViewport = -((cropSize - w) / 2 + offset.x);
        const cropTopViewport = -((cropSize - h) / 2 + offset.y);

        // Convert viewport coordinates to natural image coordinates
        const sourceX = cropLeftViewport / scale;
        const sourceY = cropTopViewport / scale;
        const sourceWidth = cropSize / scale;
        const sourceHeight = cropSize / scale;

        const canvas = document.createElement("canvas");
        const targetSize = Math.min(1024, Math.max(512, Math.round(sourceWidth)));
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetSize, targetSize);

        canvas.toBlob(onCrop, "image/jpeg", 0.9);
    };

    const width = baseWidth * zoom;
    const height = baseHeight * zoom;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(4,8,6,0.95)", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative max-w-md w-full rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#0d1a12] to-[#070f09] shadow-2xl p-6 md:p-8"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={18} />
                </button>

                <h3 className="text-lg font-bold text-white mb-6 font-mono tracking-widest uppercase text-center">
                    Crop Avatar (1:1 Ratio)
                </h3>

                {/* Cropping viewport */}
                <div className="flex justify-center items-center mb-8">
                    <div
                        ref={containerRef}
                        className="relative w-[240px] h-[240px] border border-white/5 bg-[#030604] select-none"
                        style={{ touchAction: "none" }}
                    >
                        {/* The image being cropped */}
                        {imageUrl && (
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Avatar Source"
                                onLoad={handleImageLoad}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleTouchStart}
                                className="absolute cursor-grab active:cursor-grabbing max-w-none origin-center"
                                style={{
                                    width: `${width}px`,
                                    height: `${height}px`,
                                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                                    left: `${(cropSize - width) / 2}px`,
                                    top: `${(cropSize - height) / 2}px`,
                                    opacity: loading ? 0 : 1,
                                    transition: loading ? "none" : "opacity 0.2s ease",
                                }}
                            />
                        )}

                        {/* Circular cut-out overlay */}
                        <div className="absolute w-[360px] h-[360px] -left-[60px] -top-[60px] overflow-hidden pointer-events-none z-10">
                            <div
                                className="w-[240px] h-[240px] rounded-full border-2 border-dashed border-emerald-500/40 shadow-[0_0_0_9999px_rgba(4,8,6,0.75)] absolute left-[60px] top-[60px]"
                                style={{ boxShadow: "0 0 0 9999px rgba(4,8,6,0.75)" }}
                            />
                        </div>

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#040806]/80 z-20">
                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Help Indicator */}
                        {!loading && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest flex items-center gap-1 pointer-events-none z-20">
                                <Move size={10} /> Drag to position
                            </div>
                        )}
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                        <span className="flex items-center gap-1">
                            <ZoomOut size={12} /> Zoom Out
                        </span>
                        <span className="text-emerald-400">{Math.round(zoom * 100)}%</span>
                        <span className="flex items-center gap-1">
                            <ZoomIn size={12} /> Zoom In
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={zoom}
                        onChange={handleZoomChange}
                        disabled={loading}
                        className="w-full h-1.5 rounded-lg bg-white/10 accent-emerald-500 cursor-pointer outline-none focus:ring-1 focus:ring-emerald-500/30"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all font-mono tracking-wider"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleCrop}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-black font-bold text-sm hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 transition-all font-mono tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        CROP & SAVE
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
