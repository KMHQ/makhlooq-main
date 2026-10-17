"use client";
import { Rocket, Database, CheckCircle, Layers } from "lucide-react";

export default function FleetAdminStats({ ships, filtered }) {
    const stats = [
        { label: "Total Ships", value: ships.length, icon: Rocket, color: "emerald" },
        { label: "With 3D Models", value: ships.filter((s) => s.model_path).length, icon: Layers, color: "blue" },
        { label: "Mesh Types", value: [...new Set(ships.map((s) => s.mesh_type).filter(Boolean))].length, icon: Database, color: "purple" },
        { label: "In View", value: filtered.length, icon: CheckCircle, color: "green" },
    ];

    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        green: "text-green-400 bg-green-500/10 border-green-500/20",
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map(({ label, value, icon: Icon, color }) => (
                <div
                    key={label}
                    className="rounded-2xl border border-white/5 bg-[#040c08]/60 px-6 py-5 backdrop-blur-sm hover:border-emerald-500/10 transition-colors"
                >
                    <div className={`inline-flex p-2 rounded-lg border mb-3 ${colors[color]}`}>
                        <Icon size={16} />
                    </div>
                    <div className="text-3xl font-bold text-white font-mono mb-1">{value}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{label}</div>
                </div>
            ))}
        </div>
    );
}
