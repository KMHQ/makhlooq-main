"use client";

import React from "react";
import { motion } from "motion/react";

export default function TeamStatsBar({ members }) {
    const active = members.filter((m) => m.status === "active").length;
    const command = members.filter((m) => ["commander", "admiral", "captain", "lead"].some((r) => m.role.toLowerCase().includes(r))).length;

    const stats = [
        { label: "Total Personnel", value: members.length, color: "text-white" },
        { label: "Active Personnel", value: active, color: "text-emerald-400", pulse: true },
        { label: "Command Staff", value: command, color: "text-cyan-400" },
        { label: "Deployments", value: 12, color: "text-purple-400" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#040c08]/50 border border-emerald-500/10 rounded-2xl p-6 backdrop-blur-sm"
                >
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                    <div className={`text-3xl font-bold font-mono flex items-center gap-3 ${stat.color}`}>
                        {stat.pulse && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                        {stat.value}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
