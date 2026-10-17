"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

const MESH_TYPES = ["capital", "fighter", "explorer", "medium", "industrial", "luxury"];
const ACCENT_PRESETS = ["#4A6D56", "#10b981", "#34d399", "#ff3366", "#ffaa00", "#ff8800", "#aa88ff", "#3b82f6"];

const BLANK_SHIP = {
    ship_id: "",
    name: "",
    manufacturer: "",
    ship_class: "",
    role: "",
    crew: "",
    length: "",
    mass: "",
    cargo: "",
    top_speed: "",
    description: "",
    model_path: "",
    thumbnail: "",
    mesh_type: "medium",
    accent_color: "#4A6D56",
    weapons: "",
    features: "",
    shield_pct: 50,
    armor_pct: 50,
    firepower_pct: 50,
    speed_pct: 50,
    stealth_pct: 50,
};

export default function FleetAdminAddModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ ...BLANK_SHIP });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        if (!form.ship_id || !form.name) {
            setError("Ship ID and name are required.");
            return;
        }
        setSaving(true);
        const err = await onAdd(form);
        if (err) {
            setError(err);
            setSaving(false);
            return;
        }
        onClose();
    };

    const field = (key, label, placeholder = "", type = "text") => (
        <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm outline-none focus:border-emerald-500/40 transition-colors"
            />
        </div>
    );

    const slider = (key, label) => (
        <div className="space-y-1">
            <div className="flex justify-between">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</label>
                <span className="text-[10px] text-emerald-400 font-mono">{form[key]}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: parseInt(e.target.value) }))}
                className="w-full accent-emerald-500"
            />
        </div>
    );

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-[#0a1a12] border border-emerald-500/20 rounded-2xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Register New Ship</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">Fleet Command Registry</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        {field("ship_id", "Unique Ship ID *", "e.g. idris_p")}
                        {field("name", "Display Name *", "e.g. Aegis Idris-P")}
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        {field("manufacturer", "Manufacturer", "e.g. Aegis Dynamics")}
                        {field("ship_class", "Ship Class", "e.g. Capital Corvette")}
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        {field("role", "Combat Role", "e.g. Command & Control")}
                        {field("crew", "Crew Requirement", "e.g. 10-12")}
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                        {field("length", "Length", "236m")}
                        {field("cargo", "Cargo Capacity", "228 SCU")}
                        {field("top_speed", "Top Speed", "155 m/s")}
                    </div>

                    {field("description", "Description", "Ship background lore...")}

                    <div className="grid grid-cols-2 gap-5 bg-black/20 p-4 rounded-xl border border-white/5">
                        {field("model_path", "3D Model (.glb)", "/models/ships/name.glb")}
                        {field("thumbnail", "Preview Image", "/backgrounds/image.png")}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {field("weapons", "Weapon Loadout", "8× S4, 4× S5")}
                        {field("features", "Special Features", "Command Bridge, Fighter Bay")}
                    </div>

                    <div className="grid grid-cols-2 gap-5 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                        <div className="space-y-2">
                            <label className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Base Mesh Type</label>
                            <select
                                value={form.mesh_type}
                                onChange={(e) => setForm((f) => ({ ...f, mesh_type: e.target.value }))}
                                className="w-full rounded-lg border border-emerald-500/20 bg-black/50 px-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500/60"
                            >
                                {MESH_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">HUD Accent Color</label>
                            <div className="flex items-center gap-3 bg-black/50 p-2 rounded-lg border border-emerald-500/20">
                                <input
                                    type="color"
                                    value={form.accent_color}
                                    onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0 shrink-0"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {ACCENT_PRESETS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setForm((f) => ({ ...f, accent_color: c }))}
                                            className="w-5 h-5 rounded border border-white/20 hover:scale-110 hover:border-white transition-all"
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px bg-white/10 flex-1" />
                            <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Combat Profile</div>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {slider("shield_pct", "Shield Capacity")}
                            {slider("armor_pct", "Hull Armor")}
                            {slider("firepower_pct", "Firepower")}
                            {slider("speed_pct", "Maneuverability")}
                            {slider("stealth_pct", "Stealth/Emissions")}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                        <Shield size={14} /> {error}
                    </div>
                )}

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                        {saving ? "Registering to Database…" : "Register Ship"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
