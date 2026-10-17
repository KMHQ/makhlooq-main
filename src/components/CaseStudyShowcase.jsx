"use client";

import React, { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";

const projects = [
    {
        id: 1,
        title: "United We Stand",
        subtitle: "Community First",
        image: "/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg",
        description:
            "Our Discord community is built on the foundation of trust and camaraderie. Every member brings unique skills and perspectives, creating a diverse and supportive environment where we grow together. From casual conversations to coordinated operations, we are always there for each other.",
    },
    {
        id: 2,
        title: "Always Together",
        subtitle: "Fleet Operations",
        image: "/backgrounds/SC-3.19_20230524_130313_Fleet-selfie_ILW2953_f.png",
        description:
            "Whether we are exploring new systems, engaging in fleet battles, or simply hanging out in voice channels, our bond remains unbreakable. The fleet selfie captures the spirit of our community - united, ready, and always moving forward as one cohesive unit.",
    },
    {
        id: 3,
        title: "Beyond Boundaries",
        subtitle: "Shared Adventures",
        image: "/backgrounds/SC-3.24_20241207_170744_Hornets-Over-Lake_f.png",
        description:
            "Together we push the limits of what is possible. Our shared adventures span across multiple games and experiences, but the connection we share transcends any virtual world. We are not just a Discord server - we are a family that sticks together through every challenge.",
    },
];

// --- ANIMATED COMPONENT FOR EACH ROW ---
function FeatureRow({ project, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // If index is even (0, 2), Image Left. If odd (1), Image Right.
    // We use Flexbox 'row' or 'row-reverse' to handle this easily.
    const flexDirection = index % 2 === 0 ? "row" : "row-reverse";

    return (
        <motion.div
            ref={ref}
            className="w-full py-20 md:py-32 border-b border-gray-900"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div
                className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20"
                style={{ flexDirection: flexDirection }}
            >
                {/* --- IMAGE SECTION --- */}
                <div className="w-full md:w-3/5 group relative">
                    {/* Decorative Number Background */}
                    <div className="absolute -top-10 -left-10 text-[10rem] font-bold text-gray-800 leading-none opacity-20 pointer-events-none">
                        0{index + 1}
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-800 group-hover:border-[#4A6D56]/50 transition-colors duration-500">
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-[400px] md:h-[500px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
                    </div>
                </div>

                {/* --- TEXT SECTION --- */}
                <div className="w-full md:w-2/5 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-[#4A6D56]" />
                        <span className="text-[#4A6D56] font-mono tracking-widest text-sm uppercase">{project.subtitle}</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">{project.title}</h2>

                    <p className="text-gray-400 leading-relaxed text-lg">{project.description}</p>

                    <button className="w-fit px-6 py-3 border border-gray-700 rounded text-gray-300 hover:border-white hover:text-white transition-colors font-mono text-sm uppercase mt-4">
                        Join Us
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// --- MAIN EXPORT ---
export default function CaseStudyShowcase() {
    return (
        <section className="w-full bg-black text-white">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-sm font-mono text-gray-500 tracking-[0.2em] mb-4">COMMUNITY</h2>
                <h3 className="text-3xl md:text-5xl font-bold">OUR JOURNEY</h3>
            </div>
            {/* Map through the 3 items */}
            {projects.map((project, index) => (
                <FeatureRow key={project.id} project={project} index={index} />
            ))}
            <div className="h-20" /> {/* Spacer at bottom */}
        </section>
    );
}
