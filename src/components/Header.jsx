"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

// ▸ NAVIGATION ITEMS (Accessibility: Semantic structure)
const navItems = [
    { href: "/", label: "Home" },
    { href: "/team", label: "Team" },
    { href: "/fleet", label: "Fleet" },
    { href: "/news", label: "News" },
];

export default function Header({
    isMuted: controlledMuted,
    setIsMuted: setControlledMuted,
    volume: controlledVolume,
    setVolume: setControlledVolume,
    siteSettings,
}) {
    const [showVolume, setShowVolume] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [localMuted, setLocalMuted] = useState(true);
    const [localVolume, setLocalVolume] = useState(0.2);

    const isMuted = controlledMuted ?? localMuted;
    const volume = controlledVolume ?? localVolume;
    const setIsMuted = setControlledMuted ?? setLocalMuted;
    const setVolume = setControlledVolume ?? setLocalVolume;

    const toggleMusic = () => {
        setIsMuted(!isMuted);
    };

    return (
        <>
            {/* ▸ MAIN HEADER */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                className="header"
                role="banner"
            >
                <div className="header-left">
                    {/* ▸ LOGO LINK */}
                    <Link href="/" aria-label="Khalai Makhlooq - Home">
                        <motion.div whileHover={{ scale: 1.05 }} className="header-logo" onClick={() => setMobileOpen(false)}>
                            <div className="header-logo-mark" style={{ background: "none" }}>
                                <img
                                    src="/logo.png"
                                    alt={`${siteSettings?.footer?.orgName || "Khalai Makhlooq"} Logo`}
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                    loading="eager"
                                />
                            </div>
                            {(siteSettings?.footer?.orgName || "KHALAI MAKHLOOQ").toUpperCase()}
                        </motion.div>
                    </Link>

                    {/* ▸ MOBILE MENU TOGGLE (Accessibility: ARIA expanded state) */}
                    <button
                        type="button"
                        className={`nav-toggle ${mobileOpen ? "open" : ""}`}
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-expanded={mobileOpen}
                        aria-label="Toggle navigation menu"
                        aria-controls="main-nav"
                    >
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                    </button>

                    {/* ▸ NAVIGATION MENU (Accessibility: Semantic nav + proper labeling) */}
                    <nav
                        id="main-nav"
                        className={`header-nav ${mobileOpen ? "nav-open" : ""}`}
                        role="navigation"
                        aria-label="Main navigation"
                    >
                        {(siteSettings?.navLinks || navItems).map((item, i) => (
                            <Link href={item.href} key={item.href}>
                                <motion.span
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    className="block"
                                    role="menuitem"
                                >
                                    {item.label}
                                </motion.span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* ▸ HEADER RIGHT - MUSIC CONTROLS */}
                <div className="header-right">
                    <div
                        className="music-control-group"
                        onMouseEnter={() => setShowVolume(true)}
                        onMouseLeave={() => setShowVolume(false)}
                        style={{ display: "flex", alignItems: "center", gap: "16px" }}
                        role="group"
                        aria-label="Music controls"
                    >
                        {/* ▸ VOLUME SLIDER (Accessibility: Proper label + ARIA) */}
                        <motion.div
                            animate={{ width: showVolume ? "80px" : "0px", opacity: showVolume ? 1 : 0 }}
                            className="volume-slider-wrap"
                            style={{ overflow: "hidden", display: "flex", alignItems: "center" }}
                        >
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    if (parseFloat(e.target.value) > 0 && isMuted) setIsMuted(false);
                                }}
                                aria-label="Volume level"
                                aria-valuemin={0}
                                aria-valuemax={1}
                                aria-valuenow={volume}
                                aria-valuetext={`${Math.round(volume * 100)}%`}
                                style={{
                                    width: "80px",
                                    height: "2px",
                                    appearance: "none",
                                    background: "rgba(74, 109, 86, 0.4)",
                                    outline: "none",
                                    cursor: "pointer",
                                }}
                            />
                        </motion.div>

                        {/* ▸ MUSIC TOGGLE BUTTON (Accessibility: Proper button with ARIA) */}
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={toggleMusic}
                            className="night-mode-btn"
                            style={{ cursor: "pointer" }}
                            aria-label={`Turn music ${isMuted ? "on" : "off"}`}
                            aria-pressed={!isMuted}
                            type="button"
                        >
                            <span>Music {!isMuted ? "ON" : "OFF"}</span>
                            <div className="plus-wrap" aria-hidden="true">
                                <div className="plus-wrap-line plus-wrap-line-1" />
                                <div
                                    className="plus-wrap-line plus-wrap-line-2"
                                    style={{
                                        transform: !isMuted ? "translateX(-50%) rotateZ(0deg)" : "translateX(-50%) rotateZ(90deg)",
                                    }}
                                />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.header>
        </>
    );
}
