"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Preloader() {
    const preloaderRef = useRef(null);
    const imgBlockRef = useRef(null);
    const percentRef = useRef(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let rafId;
        let displayedProgress = 0;
        let targetProgress = 0;
        let canExit = false;
        const startTime = performance.now();
        const minDuration = 950;
        const maxDuration = 8000;

        const setTarget = (value) => {
            targetProgress = Math.max(targetProgress, Math.min(100, Math.round(value)));
        };

        const waitForWindowLoad = () =>
            new Promise((resolve) => {
                if (document.readyState === "complete") {
                    resolve();
                    return;
                }
                window.addEventListener("load", resolve, { once: true });
            });

        const waitForImages = async () => {
            const images = Array.from(document.images || []);
            if (images.length === 0) return;

            let completed = images.filter((img) => img.complete).length;
            setTarget(20 + (completed / images.length) * 40);

            await Promise.allSettled(
                images.map((img) => {
                    if (img.complete) return Promise.resolve();
                    if (typeof img.decode === "function") {
                        return img.decode().catch(() => {});
                    }
                    return new Promise((resolve) => {
                        img.addEventListener("load", resolve, { once: true });
                        img.addEventListener("error", resolve, { once: true });
                    });
                }),
            );
        };

        const waitForVideos = async () => {
            const videos = Array.from(document.querySelectorAll("video"));
            if (videos.length === 0) return;

            await Promise.allSettled(
                videos.map((video) => {
                    if (video.readyState >= 1) return Promise.resolve();
                    return new Promise((resolve) => {
                        video.addEventListener("loadedmetadata", resolve, { once: true });
                        video.addEventListener("canplay", resolve, { once: true });
                        video.addEventListener("error", resolve, { once: true });
                    });
                }),
            );
        };

        const waitForFonts = async () => {
            if (!document.fonts?.ready) return;
            await document.fonts.ready.catch(() => {});
        };

        const completeLoading = async () => {
            setTarget(8);
            await waitForWindowLoad();
            if (cancelled) return;
            setTarget(30);
            await Promise.allSettled([
                waitForFonts().then(() => setTarget(50)),
                waitForImages().then(() => setTarget(72)),
                waitForVideos().then(() => setTarget(88)),
            ]);
            if (cancelled) return;
            setTarget(100);
            canExit = true;
        };

        const fallbackTimer = window.setTimeout(() => {
            setTarget(100);
            canExit = true;
        }, maxDuration);

        completeLoading();

        function anim(now) {
            if (!preloaderRef.current || !imgBlockRef.current || !percentRef.current) return;

            const elapsed = now - startTime;
            displayedProgress += (targetProgress - displayedProgress) * 0.12;
            if (targetProgress === 100 && displayedProgress > 98.5) displayedProgress = 100;

            const progress = Math.min(displayedProgress / 100, 1);
            preloaderRef.current.style.backdropFilter = `blur(${30 * (1 - progress)}px)`;
            imgBlockRef.current.style.transform = `translateY(${-75 * progress}%)`;
            percentRef.current.textContent = String(Math.round(displayedProgress));

            if (canExit && displayedProgress >= 98.5 && elapsed >= minDuration) {
                displayedProgress = 100;
                percentRef.current.textContent = "100";
                const exitElapsed = elapsed - Math.max(minDuration, elapsed - 300);
                const f = exitElapsed / 300;
                preloaderRef.current.style.opacity = String(1 - Math.min(f, 1));
                if (f >= 1) {
                    setVisible(false);
                    document.documentElement.style.removeProperty("overflow");
                    return;
                }
            }

            if (!cancelled) {
                rafId = requestAnimationFrame(anim);
            }
        }

        rafId = requestAnimationFrame(anim);

        return () => {
            cancelled = true;
            clearTimeout(fallbackTimer);
            cancelAnimationFrame(rafId);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="preloader" ref={preloaderRef}>
            <div className="preloader-icon">
                <img src="/nobglogo.png" alt="ANVIL Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div className="preloader-img-block" ref={imgBlockRef}>
                {[1, 2].map((i) => (
                    <svg key={i} width="40" height="800" viewBox="0 0 40 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="20" y1="0" x2="20" y2="800" stroke="rgba(238,242,249,0.1)" strokeWidth="1" />
                        <g fill="rgba(238,242,249,0.15)">
                            {Array.from({ length: 20 }).map((_, j) => (
                                <rect key={j} x="16" y={j * 40} width="8" height="1" />
                            ))}
                        </g>
                    </svg>
                ))}
            </div>
            <div className="preloader-percent">
                <span ref={percentRef}>0</span> %
            </div>
            <div className="shadow-top"></div>
            <div className="shadow-bot"></div>
        </div>
    );
}
