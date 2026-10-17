"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Save, Layout, Type, Image as ImageIcon, Loader2, RefreshCw, Layers } from "lucide-react";
import AboutDeckBridge from "../about/AboutDeckBridge";
import AboutDeckArchives from "../about/AboutDeckArchives";

export default function AboutVisualEditor() {
    const [settings, setSettings] = useState({
        bridge_heading: "",
        bridge_subtitle: "",
        bridge_background_url: "",
        archives_background_url: "",
        archives_intro_year: "",
        archives_intro_title: "",
        archives_intro_desc: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bridgeFile, setBridgeFile] = useState(null);
    const [archivesFile, setArchivesFile] = useState(null);

    // For previewing uploaded files locally before save
    const [bridgePreviewUrl, setBridgePreviewUrl] = useState("");
    const [archivesPreviewUrl, setArchivesPreviewUrl] = useState("");

    const bridgeFileInputRef = useRef(null);
    const archivesFileInputRef = useRef(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/about-settings");
                const data = await res.json();
                setSettings({
                    bridge_heading: data.bridge_heading || "",
                    bridge_subtitle: data.bridge_subtitle || "",
                    bridge_background_url: data.bridge_background_url || "",
                    archives_background_url: data.archives_background_url || "",
                    archives_intro_year: data.archives_intro_year || "",
                    archives_intro_title: data.archives_intro_title || "",
                    archives_intro_desc: data.archives_intro_desc || "",
                });
            } catch (err) {
                console.error("Failed to load about settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        if (type === "bridge") {
            setBridgeFile(file);
            setBridgePreviewUrl(objectUrl);
        } else {
            setArchivesFile(file);
            setArchivesPreviewUrl(objectUrl);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            formData.append(key, value || "");
        });

        if (bridgeFile) formData.append("bridge_background_file", bridgeFile);
        if (archivesFile) formData.append("archives_background_file", archivesFile);

        try {
            const res = await fetch("/api/about-settings", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                const updated = await res.json();
                setSettings((prev) => ({
                    ...prev,
                    bridge_background_url: updated.bridge_background_url || prev.bridge_background_url,
                    archives_background_url: updated.archives_background_url || prev.archives_background_url,
                }));
                setBridgeFile(null);
                setArchivesFile(null);
                setBridgePreviewUrl("");
                setArchivesPreviewUrl("");
            }
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setSaving(false);
        }
    };

    // The settings passed to the preview components
    const previewSettings = {
        ...settings,
        bridge_background_url: bridgePreviewUrl || settings.bridge_background_url,
        archives_background_url: archivesPreviewUrl || settings.archives_background_url,
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-500 gap-4 h-full min-h-[500px]">
                <Loader2 size={32} className="animate-spin" />
                <span className="font-mono text-xs tracking-widest uppercase">Initializing Canvas...</span>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-[#050B08] rounded-[2rem] border border-white/[0.07] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {/* Left Pane: Live Preview Canvas */}
            <div className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar bg-black">
                <div className="sticky top-0 z-50 bg-[#050B08]/90 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                        <Layout size={14} /> Live Canvas Preview
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-emerald-500/70 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                            100% Zoom
                        </span>
                    </div>
                </div>

                {/* The Actual Page Components Preview */}
                <div className="origin-top relative pointer-events-none w-full">
                    {/* We make it pointer-events-none so interactions don't interfere with the admin UI */}
                    <AboutDeckBridge settings={previewSettings} />
                    <AboutDeckArchives settings={previewSettings} />
                </div>
            </div>

            {/* Right Pane: Inspector (Figma-like properties panel) */}
            <div className="w-[380px] bg-[#020402] border-l border-white/[0.07] flex flex-col shrink-0">
                {/* Inspector Header */}
                <div className="h-14 border-b border-white/[0.07] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                        <Layers size={16} className="text-emerald-500" /> Page Properties
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? "Saving..." : "Publish"}
                    </button>
                </div>

                {/* Inspector Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {/* Section: Bridge */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                            Deck 01: Bridge
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <Type size={10} /> Heading
                            </label>
                            <input
                                type="text"
                                value={settings.bridge_heading}
                                onChange={(e) => handleChange("bridge_heading", e.target.value)}
                                placeholder="e.g. KHALAI MAKHLOOQ"
                                className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <Type size={10} /> Subtitle
                            </label>
                            <textarea
                                rows="2"
                                value={settings.bridge_subtitle}
                                onChange={(e) => handleChange("bridge_subtitle", e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <ImageIcon size={10} /> Background Image
                            </label>
                            <div
                                onClick={() => bridgeFileInputRef.current?.click()}
                                className="w-full h-24 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group overflow-hidden relative"
                            >
                                {bridgePreviewUrl || settings.bridge_background_url ? (
                                    <>
                                        <img
                                            src={bridgePreviewUrl || settings.bridge_background_url}
                                            alt="Bridge BG"
                                            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                                        />
                                        <span className="relative z-10 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                            Replace Image
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={18} className="text-gray-500 group-hover:text-emerald-400" />
                                        <span className="text-[10px] text-gray-500 font-mono">Upload Image</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={bridgeFileInputRef}
                                onChange={(e) => handleFileChange(e, "bridge")}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Section: Archives */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                            Deck 02: Archives
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <Type size={10} /> Intro Year
                            </label>
                            <input
                                type="text"
                                value={settings.archives_intro_year}
                                onChange={(e) => handleChange("archives_intro_year", e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <Type size={10} /> Intro Title
                            </label>
                            <input
                                type="text"
                                value={settings.archives_intro_title}
                                onChange={(e) => handleChange("archives_intro_title", e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <Type size={10} /> Intro Description
                            </label>
                            <textarea
                                rows="2"
                                value={settings.archives_intro_desc}
                                onChange={(e) => handleChange("archives_intro_desc", e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase">
                                <ImageIcon size={10} /> Background Image
                            </label>
                            <div
                                onClick={() => archivesFileInputRef.current?.click()}
                                className="w-full h-24 border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group overflow-hidden relative"
                            >
                                {archivesPreviewUrl || settings.archives_background_url ? (
                                    <>
                                        <img
                                            src={archivesPreviewUrl || settings.archives_background_url}
                                            alt="Archives BG"
                                            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                                        />
                                        <span className="relative z-10 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                                            Replace Image
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={18} className="text-gray-500 group-hover:text-emerald-400" />
                                        <span className="text-[10px] text-gray-500 font-mono">Upload Image</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={archivesFileInputRef}
                                onChange={(e) => handleFileChange(e, "archives")}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
