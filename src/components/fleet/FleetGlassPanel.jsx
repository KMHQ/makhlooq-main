"use client";

import React from "react";
import { motion } from "motion/react";

export default function FleetGlassPanel({ children, className = "", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`bg-gradient-to-br from-white/10 via-white/5 to-white/2 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl ${className}`}
            style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
        >
            {children}
        </motion.div>
    );
}
