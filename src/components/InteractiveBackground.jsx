"use client";

import { useEffect } from "react";

export default function InteractiveBackground() {
    useEffect(() => {
        const root = document.documentElement;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

        let pointerX = 50;
        let pointerY = 24;
        let scrollDepth = 0;
        let frame = 0;

        const sync = () => {
            const shiftX = (pointerX - 50) * 0.42;
            const shiftY = (pointerY - 50) * 0.24;
            root.style.setProperty("--bg-pointer-x", `${pointerX.toFixed(2)}vw`);
            root.style.setProperty("--bg-pointer-y", `${pointerY.toFixed(2)}vh`);
            root.style.setProperty("--fx-shift-x", `${shiftX.toFixed(2)}px`);
            root.style.setProperty("--fx-shift-y", `${shiftY.toFixed(2)}px`);
            root.style.setProperty("--bg-scroll", scrollDepth.toFixed(3));
            root.style.setProperty("--bg-tilt", `${((pointerX - 50) * 0.12).toFixed(2)}deg`);
            frame = 0;
        };

        const queueSync = () => {
            if (!frame && !reducedMotion) {
                frame = window.requestAnimationFrame(sync);
            }
        };

        const handleMove = (event) => {
            pointerX = (event.clientX / window.innerWidth) * 100;
            pointerY = (event.clientY / window.innerHeight) * 100;
            root.dataset.siteFxMuted = event.target?.closest?.("[data-no-site-fx]") ? "true" : "false";
            queueSync();
        };

        const handleLeave = () => {
            pointerX = 50;
            pointerY = 24;
            root.dataset.siteFxMuted = "false";
            queueSync();
        };

        const handleScroll = () => {
            const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            scrollDepth = Math.min(window.scrollY / maxScroll, 1);
            queueSync();
        };

        root.style.setProperty("--bg-pointer-x", "50vw");
        root.style.setProperty("--bg-pointer-y", "24vh");
        root.style.setProperty("--fx-shift-x", "0px");
        root.style.setProperty("--fx-shift-y", "0px");
        root.style.setProperty("--bg-scroll", "0");
        root.style.setProperty("--bg-tilt", "0deg");
        root.dataset.siteFxMuted = "false";

        if (!coarsePointer) {
            window.addEventListener("pointermove", handleMove, { passive: true });
        }
        window.addEventListener("pointerleave", handleLeave);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        sync();

        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerleave", handleLeave);
            window.removeEventListener("scroll", handleScroll);
            if (frame) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, []);

    return (
        <div className="interactive-site-fx" aria-hidden="true">
            <div className="interactive-site-fx__stars" />
            <div className="interactive-site-fx__mesh" />
            <div className="interactive-site-fx__orbits" />
            <div className="interactive-site-fx__scan" />
            <div className="interactive-site-fx__cursor" />
        </div>
    );
}
