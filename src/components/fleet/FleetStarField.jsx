"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";

export default function FleetStarField({ mousePosition }) {
    const stars = useMemo(() => {
        return Array.from({ length: 200 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.8 + 0.2,
            twinkle: Math.random() * 2 + 1,
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: star.size,
                        height: star.size,
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        opacity: star.opacity,
                    }}
                    animate={{
                        opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                        scale: [1, star.twinkle, 1],
                        y: [0, -star.speed * 100, -star.speed * 200],
                    }}
                    transition={{
                        duration: 10 + star.id * 0.1,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Mouse-reactive nebula effect */}
            {mousePosition && (
                <motion.div
                    className="absolute w-96 h-96 rounded-full"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                        background: "radial-gradient(circle, rgba(0, 150, 255, 0.1) 0%, transparent 60%)",
                        filter: "blur(40px)",
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}
        </div>
    );
}
