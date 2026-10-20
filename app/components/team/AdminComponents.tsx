"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { CATEGORIES, PRESET_COLORS, SEC_LEVELS, getRoleConfig } from "./teamConfig";

const blankMember = () => ({
    discord_uid: "",
    discord_tag: "",
    name: "",
    role: "KMHQ",
    category: "Makhlooq",
    sec_level: "R0",
    node_color: "#10b981",
    bio: "",
    status: "inactive",
    is_admin: false,
    avatar_url: "",
    flair_color: "#10b981",
    flair_icon: "zap",
    joined_at: new Date().toISOString().split("T")[0],
});

type MemberForm = ReturnType<typeof blankMember>;
type TextField = { [K in keyof MemberForm]: MemberForm[K] extends string ? K : never }[keyof MemberForm];

export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="h-7 w-7 rounded-full border-2 border-white/20 transition-transform hover:scale-110"
                style={{ background: value }}
                title="Change color"
            />
            {open && (
                <div className="absolute left-0 top-9 z-50 rounded-xl border border-emerald-500/20 bg-[#0d1f15] p-3 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3 grid grid-cols-4 gap-1.5">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    onChange(c);
                                    setOpen(false);
                                }}
                                className="h-6 w-6 rounded-full border border-transparent transition-all hover:scale-110 hover:border-white/50"
                                style={{ background: c }}
                            />
                        ))}
                    </div>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-8 w-full cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                </div>
            )}
        </div>
    );
}

export function AddMemberModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
    const [form, setForm] = useState(blankMember);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        if (!form.discord_uid) {
            setError("Discord UID is required.");
            return;
        }
        setSaving(true);
        const res = await fetch("/api/team-members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.error || "Failed to deploy member.");
            setSaving(false);
            return;
        }
        onAdded();
        onClose();
    };

    const field = (key: TextField, label: string, type = "text", opts: string[] | null = null) => (
        <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
            {key === "bio" ? (
                <textarea
                    value={form[key] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500/40"
                    placeholder="Member bio / story..."
                />
            ) : opts ? (
                <select
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500/40"
                >
                    {opts.map((o) => (
                        <option key={o} value={o} className="bg-[#0a1a12]">
                            {o}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500/40"
                />
            )}
        </div>
    );

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-emerald-500/20 bg-[#0a1a12] p-8 shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-white">Add Fleet Member</h3>
                    <button onClick={onClose} className="text-gray-500 transition-colors hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {field("discord_uid", "Discord UID *")}
                    {field("discord_tag", "Discord Tag")}
                    {/* Multiple Flairs Editor */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Flairs</label>
                        <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2.5">
                            {(form.role || "")
                                .split(",")
                                .map((r) => r.trim())
                                .filter(Boolean)
                                .map((flair) => {
                                    const { accent: flairAccent } = getRoleConfig(flair);
                                    const currentAccent = flairAccent || "#10b981";
                                    return (
                                        <span
                                            key={flair}
                                            className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs"
                                            style={{
                                                color: currentAccent,
                                                borderColor: `${currentAccent}30`,
                                                background: `${currentAccent}10`,
                                            }}
                                        >
                                            {flair}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const remaining = (form.role || "")
                                                        .split(",")
                                                        .map((x) => x.trim())
                                                        .filter((x) => x !== flair)
                                                        .join(", ");
                                                    setForm((f) => ({ ...f, role: remaining }));
                                                }}
                                                className="ml-1 cursor-pointer font-bold transition-colors hover:text-red-400"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    );
                                })}
                            {(form.role || "")
                                .split(",")
                                .map((r) => r.trim())
                                .filter(Boolean).length === 0 && <span className="text-xs italic text-gray-500">No flairs configured</span>}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="new-flair-input"
                                placeholder="Type new flair..."
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none transition-colors focus:border-emerald-500/40"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            const current = (form.role || "")
                                                .split(",")
                                                .map((x) => x.trim())
                                                .filter(Boolean);
                                            if (!current.includes(val)) {
                                                setForm((f) => ({ ...f, role: [...current, val].join(", ") }));
                                            }
                                            e.currentTarget.value = "";
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const input = document.getElementById("new-flair-input") as HTMLInputElement | null;
                                    const val = input?.value.trim();
                                    if (input && val) {
                                        const current = (form.role || "")
                                            .split(",")
                                            .map((x) => x.trim())
                                            .filter(Boolean);
                                        if (!current.includes(val)) {
                                            setForm((f) => ({ ...f, role: [...current, val].join(", ") }));
                                        }
                                        input.value = "";
                                    }
                                }}
                                className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/30"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                    {field("flair_icon", "Flair Icon", "text", ["crown", "shield", "sword", "users", "zap", "terminal", "none"])}

                    <div className="py-2">
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Flair Color</label>
                        <div className="flex items-center gap-3">
                            <ColorPicker value={form.flair_color} onChange={(c) => setForm((f) => ({ ...f, flair_color: c }))} />
                            <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white">{form.flair_color}</span>
                        </div>
                    </div>

                    {field("category", "Rank", "text", CATEGORIES)}
                    {field("sec_level", "Clearance Level", "text", SEC_LEVELS)}
                    {field("status", "Status", "text", ["active", "inactive"])}
                    {field("joined_at", "Deployed Date", "date")}
                    {field("avatar_url", "Avatar URL", "url")}
                    {field("bio", "Bio")}

                    <div className="py-2">
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Frame Color</label>
                        <div className="flex items-center gap-3">
                            <ColorPicker value={form.node_color} onChange={(c) => setForm((f) => ({ ...f, node_color: c }))} />
                            <span className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-white">{form.node_color}</span>
                        </div>
                    </div>

                    <label className="group flex cursor-pointer items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            checked={form.is_admin}
                            onChange={(e) => setForm((f) => ({ ...f, is_admin: e.target.checked }))}
                            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-emerald-500"
                        />
                        <span className="text-sm text-gray-400 transition-colors group-hover:text-white">Grant Administrative Access</span>
                    </label>
                </div>

                {error && <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{error}</p>}

                <button
                    onClick={save}
                    disabled={saving}
                    className="mt-8 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-[#040806] shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-400 disabled:opacity-50"
                >
                    {saving ? "Processing…" : "Deploy Member"}
                </button>
            </motion.div>
        </motion.div>
    );
}
