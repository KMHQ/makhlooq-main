"use client";

import { createElement, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { isUnoptimized } from "@/app/lib/media";
import { AnimatePresence } from "motion/react";
import { Upload, Palette, Shield } from "lucide-react";
import type { TeamMember } from "@/payload-types";
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
                className="flex items-center gap-8 rounded-3xl border bg-[#040c08]/50 p-8 backdrop-blur-xl transition-all"
                style={{ borderColor: `${color}30`, boxShadow: `0 0 40px ${color}05` }}
            >
                <div className="relative flex-shrink-0">
                    <div
                        className="h-24 w-24 overflow-hidden rounded-2xl border-2 shadow-2xl transition-transform hover:scale-105"
                        style={{ borderColor: color, boxShadow: `0 0 30px ${color}40` }}
                    >
                        {member.avatar_url ? (
                            <Image
                                src={member.avatar_url}
                                alt={member.name}
                                width={96}
                                height={96}
                                unoptimized={isUnoptimized(member.avatar_url)}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center text-3xl font-bold"
                                style={{ background: color, color: "#040806" }}
                            >
                                {member.name?.[0]}
                            </div>
                        )}
                    </div>
                    <span
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-4 border-[#040806] shadow-lg"
                        style={{ background: form.status === "active" ? "#22c55e" : "#6b7280" }}
                    />
                </div>
                <div>
                    <div className="text-2xl font-bold tracking-tight text-white">{member.name}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
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
                    <div className="mt-2.5 font-mono text-xs text-gray-600">{member.discord_tag || "DISCORD_N/A"}</div>
                    {member.is_admin && (
                        <div className="mt-3 flex w-fit items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
                            <Shield size={10} className="text-emerald-400" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Admin Power</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar upload */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                    <Upload size={16} className="text-emerald-500" /> Avatar Upload
                </h3>
                <label className="group flex cursor-pointer items-center gap-4">
                    <div className="flex-1 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center transition-all group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5">
                        <p className="text-sm font-medium text-gray-500 group-hover:text-emerald-400">
                            {uploading ? "Uploading avatar..." : "Upload your best photo (PNG/JPG, Max 20MB)"}
                        </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>

            {/* Node color */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                    <Palette size={16} className="text-emerald-500" /> Frame Color
                </h3>
                <div className="mb-8 grid grid-cols-4 gap-3 sm:grid-cols-6">
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
                    <div className="relative flex-1">
                        <input
                            value={form.node_color}
                            onChange={(e) => setForm((f) => ({ ...f, node_color: e.target.value }))}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none transition-colors focus:border-emerald-500/40"
                        />
                    </div>
                </div>
            </div>

            {/* Status, Admin Power, Joining Date & Bio */}
            <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 p-8 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-5">
                        {/* Status Toggle */}
                        <div>
                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Active Status
                            </label>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, status: f.status === "active" ? "inactive" : "active" }))}
                                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-bold transition-all ${
                                    form.status === "active"
                                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                        : "border-gray-600/30 bg-gray-800/40 text-gray-400 hover:bg-gray-800/60"
                                }`}
                            >
                                <span className="flex items-center gap-2.5">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${form.status === "active" ? "animate-pulse bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-gray-500"}`}
                                    />
                                    {form.status === "active" ? "ACTIVE" : "INACTIVE"}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest opacity-60">TOGGLE</span>
                            </button>
                        </div>

                        {/* Admin Power Toggle (if admin) */}
                        {member.is_admin !== undefined && (
                            <div>
                                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    Admin Administrative Power
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, is_admin: !f.is_admin }))}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm font-bold transition-all ${
                                        form.is_admin
                                            ? "border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                            : "border-gray-600/30 bg-gray-800/40 text-gray-400 hover:bg-gray-800/60"
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

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Joining Date</label>
                            <div className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-sm text-white/50">
                                <span>
                                    {form.joined_at
                                        ? new Date(form.joined_at).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                          })
                                        : "N/A"}
                                </span>
                                <span className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                                    Read Only
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Biography</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                            className="h-44 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/40"
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
