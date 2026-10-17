"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorSpotlight() {
    const spotRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (spotRef.current) {
                spotRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
            }
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div
            ref={spotRef}
            className="fixed pointer-events-none z-30 top-0 left-0"
            style={{
                background:
                    "radial-gradient(circle at center, rgba(185, 255, 102, 0.15) 0%, rgba(185, 255, 102, 0.05) 30%, transparent 70%)",
                width: 400,
                height: 400,
                willChange: "transform",
                transform: "translate(-200px, -200px)",
            }}
        />
    );
}
