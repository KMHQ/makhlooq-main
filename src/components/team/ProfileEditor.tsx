"use client";

import { createElement, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence } from "motion/react";
import { Upload, Palette, Shield } from "lucide-react";
import type { TeamMember } from "@/types/db";
import { ColorPicker } from "./AdminComponents";
import AvatarCropperModal from "./AvatarCropperModal";
import { PRESET_COLORS, getFlairIcon, getRoleConfig } from "./teamConfig";

export interface ProfileForm {
    node_color: string;
    bio: string;
    status: string;
    joined_at?: string;
    is_admin?: boolean;
}

interface ProfileEditorProps {
    member: TeamMember;
    form: ProfileForm;
    setForm: Dispatch<SetStateAction<ProfileForm>>;
    onUploadAvatar: (file: File) => void;
    uploading: boolean;
}

export default function ProfileEditor({ member, form, setForm, onUploadAvatar, uploading }: ProfileEditorProps) {
    const color = form.node_color;
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setCropImageSrc(URL.createObjectURL(file));
            e.target.value = "";
        }
    };

    const handleCropComplete = (croppedBlob: Blob | null) => {
        if (!selectedFile || !croppedBlob) return;
        const croppedFile = new File([croppedBlob], selectedFile.name, { type: "image/jpeg" });
        onUploadAvatar(croppedFile);
        setCropImageSrc(null);
        setSelectedFile(null);
    };

    const handleCropClose = () => {
        setCropImageSrc(null);
        setSelectedFile(null);
    };

    return (
        <div className="space-y-6">
            {/* Node preview */}
            <div
                className="rounded-3xl border bg-[#040c08]/50 p-8 flex items-center gap-8 backdrop-blur-xl transition-all"
                style={{ borderColor: `${color}30`, boxShadow: `0 0 40px ${color}05` }}
            >
                <div className="relative flex-shrink-0">
                    <div
                        className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-2xl transition-transform hover:scale-105"
                        style={{ borderColor: color, boxShadow: `0 0 30px ${color}40` }}
                    >
                        {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                                style={{ background: color, color: "#040806" }}
                            >
                                {member.name?.[0]}
                            </div>
                        )}
                    </div>
                    <span
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-[#040806] shadow-lg"
                        style={{ background: form.status === "active" ? "#22c55e" : "#6b7280" }}
                    />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white tracking-tight">{member.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {(member.role || "KMHQ")
                            .split(",")
                            .map((r) => r.trim())
                            .filter(Boolean)
                            .map((flair, idx) => {
                                const { Icon: flairIcon, accent: flairAccent } = getRoleConfig(flair);
                                const showIcon = idx === 0 ? (getFlairIcon(member.flair_icon, flairIcon) ?? flairIcon) : flairIcon;
                                const currentAccent = member.flair_color || flairAccent || "#10b981";
                                return (
                                    <span
                                        key={flair}
                                        className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full border"
                                        style={{
                                            color: currentAccent,
                                            background: `${currentAccent}12`,
                                            borderColor: `${currentAccent}30`,
                                        }}
                                    >
                                        {createElement(showIcon, { size: 10 })}
                                        {flair}
                                    </span>
                                );
                            })}
                    </div>
                    <div className="text-gray-600 text-xs mt-2.5 font-mono">{member.discord_tag || "DISCORD_N/A"}</div>
                    {member.is_admin && (
                        <div className="flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 w-fit">
                            <Shield size={10} className="text-emerald-400" />
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Admin Power</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar upload */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <Upload size={16} className="text-emerald-500" /> Avatar Upload
                </h3>
                <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="flex-1 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all">
                        <p className="text-gray-500 text-sm font-medium group-hover:text-emerald-400">
                            {uploading ? "Uploading avatar..." : "Upload your best photo (PNG/JPG, Max 20MB)"}
                        </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>

            {/* Node color */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <Palette size={16} className="text-emerald-500" /> Frame Color
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-8">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setForm((f) => ({ ...f, node_color: c }))}
                            className="aspect-square rounded-xl border-2 transition-all hover:scale-110 active:scale-95"
                            style={{
                                background: c,
                                borderColor: form.node_color === c ? "white" : "transparent",
                                boxShadow: form.node_color === c ? `0 0 20px ${c}60` : "none",
                            }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <ColorPicker value={form.node_color} onChange={(c) => setForm((f) => ({ ...f, node_color: c }))} />
                    <div className="flex-1 relative">
                        <input
                            value={form.node_color}
                            onChange={(e) => setForm((f) => ({ ...f, node_color: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/40 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Status, Admin Power, Joining Date & Bio */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        {/* Status Toggle */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">
                                Active Status
                            </label>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, status: f.status === "active" ? "inactive" : "active" }))}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border font-mono text-sm font-bold transition-all cursor-pointer ${
                                    form.status === "active"
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                        : "bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60"
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${form.status === "active" ? "bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-gray-500"}`}
                                    />
                                    {form.status === "active" ? "ACTIVE" : "INACTIVE"}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest opacity-60">TOGGLE</span>
                            </button>
                        </div>

                        {/* Admin Power Toggle (if admin) */}
                        {member.is_admin !== undefined && (
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">
                                    Admin Administrative Power
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, is_admin: !f.is_admin }))}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border font-mono text-sm font-bold transition-all cursor-pointer ${
                                        form.is_admin
                                            ? "bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                            : "bg-gray-800/40 border-gray-600/30 text-gray-400 hover:bg-gray-800/60"
                                    }`}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Shield size={14} className={form.is_admin ? "text-purple-400" : "text-gray-500"} />
                                        {form.is_admin ? "ADMIN POWER: GRANTED" : "ADMIN POWER: OFF"}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-60">TOGGLE</span>
                                </button>
                            </div>
                        )}

                        <div className="pt-2 space-y-2">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joining Date</label>
                            <div className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-white/50 text-sm font-mono flex items-center justify-between">
                                <span>
                                    {form.joined_at
                                        ? new Date(form.joined_at).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : "N/A"}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    Read Only
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Biography</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                            className="w-full h-44 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40 transition-colors resize-none"
                            placeholder="Write your story, with some style..."
                        />
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {cropImageSrc && <AvatarCropperModal imageUrl={cropImageSrc} onCrop={handleCropComplete} onClose={handleCropClose} />}
            </AnimatePresence>
        </div>
    );
}
