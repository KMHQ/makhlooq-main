"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function GridOverlay({ id, triggerSelector, isFooter = false }) {
    const gridRef = useRef(null);
    const rows = 17;
    const cols = 30;

    useEffect(() => {
        if (!gridRef.current) return;

        const squares = Array.from(gridRef.current.querySelectorAll(".square"));

        const sd = squares.map((s) => {
            const r = +s.dataset.row;
            const c = +s.dataset.col;
            // Formula from original script to create wave reveal pattern
            return { el: s, p: (rows - 1 - r) * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30 };
        });

        sd.sort((a, b) => a.p - b.p);

        if (isFooter) {
            const handleScroll = () => {
                const footer = document.querySelector(triggerSelector);
                if (!footer) return;
                const b = footer.getBoundingClientRect();
                const wh = window.innerHeight;
                let pr = Math.min(Math.max((wh - b.top) / wh, 0), 1);
                pr = Math.min(pr / 0.98, 1);
                const vc = Math.floor(sd.length * pr);
                sd.forEach((d, i) => {
                    d.el.style.opacity = i < vc ? "1" : "0";
                });
            };
            window.addEventListener("scroll", handleScroll);
            window.addEventListener("resize", handleScroll);
            handleScroll();

            return () => {
                window.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", handleScroll);
            };
        } else {
            const st = ScrollTrigger.create({
                trigger: triggerSelector,
                start: triggerSelector === "#hero" ? "top top" : "top bottom",
                end: "bottom top",
                scrub: 1,
                onUpdate: (self) => {
                    const pr = self.progress;
                    const vc = Math.floor(sd.length * pr);
                    sd.forEach((d, i) => {
                        gsap.to(d.el, { opacity: i < vc ? 1 : 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
                    });
                },
            });
            return () => st.kill();
        }
    }, [triggerSelector, isFooter]);

    return (
        <div className="square-grid" id={id} ref={gridRef}>
            {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => <div key={`${r}-${c}`} className="square" data-row={r} data-col={c} />),
            )}
        </div>
    );
}
