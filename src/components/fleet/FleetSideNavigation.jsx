"use client";

import React from "react";
import { motion } from "motion/react";

export default function FleetSideNavigation({ activeSection }) {
    const sections = ["HERO", "FLEET", "ARMOR", "HANGAR", "STATS"];
    const sectionIds = ["main-content", "fleet-1", "armor-1", "hangar", "stats"];

    const scrollToSection = (index) => {
        const element = document.getElementById(sectionIds[index]);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
            role="navigation"
            aria-label="Page sections"
        >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-4 space-y-4">
                {sections.map((section, index) => (
                    <motion.button
                        key={section}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 relative group ${
                            activeSection === index ? "bg-cyan-400 scale-125" : "bg-gray-600 hover:bg-gray-400"
                        }`}
                        whileHover={{ scale: 1.4 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => scrollToSection(index)}
                        aria-label={`Navigate to ${section} section`}
                        aria-current={activeSection === index ? "true" : "false"}
                    >
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
                            {section}
                        </span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
