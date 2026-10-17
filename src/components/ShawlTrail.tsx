"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_LEN = 35;
const TRAIL_LIFETIME = 500;
const ACCENT = [186, 255, 102] as const;

export default function ShawlTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (typeof window === "undefined") return;
        if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let W = window.innerWidth;
        let H = window.innerHeight;

        function resize() {
            if (!canvas || !ctx) return;
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();

        const mouse = { x: -9999, y: -9999, active: false };
        const trail: Array<{ x: number; y: number; t: number }> = [];
        let idleTimer: ReturnType<typeof setTimeout> | null = null;

        function onMove(e: MouseEvent) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
            trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
            if (trail.length > TRAIL_LEN) trail.shift();
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                mouse.active = false;
            }, 2200);
        }

        function onLeave() {
            mouse.active = false;
            trail.length = 0;
        }

        function update() {
            const now = performance.now();
            while (trail.length && now - trail[0].t > TRAIL_LIFETIME) trail.shift();
        }

        function drawTrail() {
            if (!ctx || trail.length < 2) return;
            const now = performance.now();
            ctx.lineCap = "round";
            for (let i = 1; i < trail.length; i++) {
                const prev = trail[i - 1];
                const curr = trail[i];
                const age = now - curr.t;
                const life = Math.max(0, 1 - age / TRAIL_LIFETIME);
                if (life <= 0) continue;
                const prog = i / (trail.length - 1);
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${life * prog * 0.92})`;
                ctx.lineWidth = life * prog * 5 + 0.6;
                ctx.stroke();
            }

            if (mouse.active && trail.length) {
                const tip = trail[trail.length - 1];
                ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.15)`;
                ctx.beginPath();
                ctx.arc(tip.x, tip.y, 28, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let raf: number;
        function loop() {
            if (!ctx) return;
            update();
            ctx.clearRect(0, 0, W, H);
            drawTrail();
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(raf);
            if (idleTimer) clearTimeout(idleTimer);
        };
    }, [mounted]);

    if (!mounted) return null;

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden="true" style={{ zIndex: 50 }} />;
}
