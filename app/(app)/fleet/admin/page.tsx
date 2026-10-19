"use client";
import { useState, useEffect, useCallback, type DragEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
    Plus,
    Search,
    Trash2,
    Edit3,
    Save,
    X,
    Shield,
    Users,
    RefreshCw,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    LogOut,
    UserPlus,
    UserMinus,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from "lucide-react";
import { AuthScreen, LoginScreen, DeniedScreen } from "@/app/components/fleet/admin/FleetAdminAuth";
import AboutNewsEditor from "@/app/components/admin/AboutNewsEditor";
import COSelector from "@/app/components/fleet/admin/COSelector";
import type { FleetConfigEntry } from "@/app/components/fleet/ships";
import type { FleetMember, TeamMember } from "@/types/db";
import type { SessionResponse, SessionUser } from "@/types/session";

type ConfigId = FleetConfigEntry["id"];
type SortField = "slug" | "enabled" | "fleet_type" | "ceo_name";
type NewFleetConfig = Omit<FleetConfigEntry, "id">;

interface SlugValidation {
    found: boolean;
    type?: string;
    fleet?: { name?: string };
    error?: string;
}

/* ───────── Helper: validate a slug via FleetYards ───────── */
async function validateFleetyardsSlug(slug: string): Promise<SlugValidation> {
    const res = await fetch(`/api/fleetyards/search?slug=${encodeURIComponent(slug)}`);
    return res.json();
}

/* ───────── Status badge ───────── */
function StatusBadge({ enabled }: { enabled: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-gray-500"
            }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
            {enabled ? "Active" : "Disabled"}
        </span>
    );
}

/* ───────── Helper: generate valid Fleetyards URL ───────── */
function getFleetyardsUrl(cfg: FleetConfigEntry) {
    if (!cfg.slug) return "https://fleetyards.net";
    return `https://fleetyards.net/ships/${encodeURIComponent(cfg.slug.trim())}`;
}

/* ───────── Single fleet row ───────── */
function FleetRow({
    cfg,
    memberCount,
    onEdit,
    onDelete,
    onToggle,
    toggling,
    onManageMembers,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragOver,
}: {
    cfg: FleetConfigEntry;
    memberCount: number;
    onEdit: (cfg: FleetConfigEntry) => void;
    onDelete: (id: ConfigId, name: string) => void;
    onToggle: (cfg: FleetConfigEntry) => void;
    toggling: ConfigId | null;
    onManageMembers: (cfg: FleetConfigEntry) => void;
    onDragStart: (id: ConfigId) => void;
    onDragOver: (id: ConfigId) => void;
    onDrop: (id: ConfigId) => void;
    onDragEnd: () => void;
    isDragOver: boolean;
}) {
    return (
        <tr
            className={`group transition-colors cursor-grab active:cursor-grabbing ${
                isDragOver ? "bg-emerald-500/[0.06] border-t-2 border-emerald-500/50" : "hover:bg-white/[0.02]"
            }`}
            draggable
            onDragStart={() => onDragStart(cfg.id)}
            onDragOver={(e: DragEvent) => {
                e.preventDefault();
                onDragOver(cfg.id);
            }}
            onDrop={() => onDrop(cfg.id)}
            onDragEnd={onDragEnd}
        >
            {/* Drag Handle */}
            <td className="pl-3 pr-0 py-5 w-8">
                <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-70 transition-opacity cursor-grab">
                    <div className="w-4 h-0.5 bg-white/60 rounded" />
                    <div className="w-4 h-0.5 bg-white/60 rounded" />
                    <div className="w-3 h-0.5 bg-white/40 rounded" />
                </div>
            </td>
            <td className="px-5 py-5">
                <div className="flex flex-col gap-1">
                    <span className="text-white font-bold text-sm tracking-wide">{cfg.display_name || cfg.slug}</span>
                    <a
                        href={getFleetyardsUrl(cfg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-gray-500 text-[10px] font-mono hover:text-emerald-400 transition-colors w-fit"
                    >
                        {cfg.slug}
                        <ExternalLink size={10} />
                    </a>
                </div>
            </td>
            <td className="px-5 py-5">
                <StatusBadge enabled={cfg.enabled !== false} />
            </td>
            <td className="px-5 py-5">
                <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${["sub_capital", "capital"].includes(cfg.fleet_type ?? "") ? "bg-lime-400/10 text-lime-400 border border-lime-400/20 shadow-[0_0_10px_rgba(163,230,53,0.1)]" : "bg-white/5 text-gray-400 border border-white/10"}`}
                >
                    {(cfg.fleet_type || "small").replace("_", "-")}
                </span>
            </td>
            <td className="px-5 py-5">
                <span className="text-gray-300 text-xs font-medium truncate max-w-[120px] block">{cfg.ceo_name || "—"}</span>
            </td>
            <td className="px-5 py-5">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onToggle(cfg)}
                        disabled={toggling === cfg.id}
                        title={cfg.enabled ? "Disable fleet" : "Enable fleet"}
                        className="p-2 rounded-lg border border-white/10 text-gray-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                    >
                        {toggling === cfg.id ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : cfg.enabled ? (
                            <ToggleRight size={14} />
                        ) : (
                            <ToggleLeft size={14} />
                        )}
                    </button>
                    <button
                        onClick={() => onManageMembers(cfg)}
                        title="Manage Members"
                        className="p-2 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                        <Users size={14} />
                    </button>
                    <button
                        onClick={() => onEdit(cfg)}
                        title="Edit"
                        className="p-2 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(cfg.id, cfg.display_name || cfg.slug)}
                        title="Remove"
                        className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ───────── Edit row ───────── */
interface EditRowProps {
    data: Partial<FleetConfigEntry>;
    onChange: <K extends keyof FleetConfigEntry>(key: K, value: FleetConfigEntry[K]) => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    teamMembers?: TeamMember[];
}

function EditRow({ data, onChange, onSave, onCancel, saving, teamMembers = [] }: EditRowProps) {
    return (
        <tr className="bg-emerald-500/[0.03] border-y border-emerald-500/20 shadow-[inset_4px_0_0_rgba(16,185,129,1)] relative z-10">
            <td className="pl-3 pr-0 py-3 w-8" /> {/* drag handle placeholder */}
            <td className="px-5 py-3">
                <div className="space-y-1.5">
                    <input
                        value={data.slug || ""}
                        onChange={(e) => onChange("slug", e.target.value)}
                        placeholder="fleetyards-slug"
                        className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs font-mono outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <input
                        value={data.display_name || ""}
                        onChange={(e) => onChange("display_name", e.target.value)}
                        placeholder="Display Name"
                        className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
            </td>
            <td className="px-5 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!data.enabled}
                        onChange={(e) => onChange("enabled", e.target.checked)}
                        className="accent-emerald-500"
                    />
                    <span className="text-xs text-gray-400">Enabled</span>
                </label>
            </td>
            <td className="px-5 py-3">
                <select
                    value={data.fleet_type || "small"}
                    onChange={(e) => onChange("fleet_type", e.target.value)}
                    className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-2 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50 transition-colors"
                >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="sub_capital">Sub-Capital</option>
                    <option value="capital">Capital</option>
                </select>
            </td>
            <td className="px-5 py-3">
                <COSelector
                    valueName={data.ceo_name || ""}
                    valueDiscordUid={data.ceo_discord_uid || ""}
                    teamMembers={teamMembers}
                    onChange={({ ceo_name, ceo_discord_uid }) => {
                        onChange("ceo_name", ceo_name);
                        onChange("ceo_discord_uid", ceo_discord_uid);
                    }}
                    placeholder="Assign CO..."
                />
            </td>
            <td className="px-5 py-3">
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                        <Save size={12} /> {saving ? "…" : "Save"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs font-bold hover:bg-white/5 transition-all"
                    >
                        <X size={12} /> Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ───────── Add Fleet Modal ───────── */
interface AddFleetModalProps {
    onClose: () => void;
    onAdd: (config: NewFleetConfig) => Promise<string | null>;
    teamMembers?: TeamMember[];
}

function AddFleetModal({ onClose, onAdd, teamMembers = [] }: AddFleetModalProps) {
    const [slug, setSlug] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [fleetType, setFleetType] = useState("small");
    const [ceoName, setCeoName] = useState("");
    const [ceoDiscordUid, setCeoDiscordUid] = useState("");
    const [selectedMemberUid, setSelectedMemberUid] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [sortOrder, setSortOrder] = useState(0);
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState<SlugValidation | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleValidate = async () => {
        if (!slug.trim()) return;
        setValidating(true);
        setValidation(null);
        setError("");
        try {
            const result = await validateFleetyardsSlug(slug.trim());
            setValidation(result);
            if (result.found && result.fleet?.name && !displayName) {
                setDisplayName(result.fleet.name);
            }
        } catch {
            setError("Validation failed — check your connection.");
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async () => {
        if (!slug.trim()) {
            setError("Slug is required.");
            return;
        }
        setSaving(true);
        setError("");
        const err = await onAdd({
            slug: slug.trim(),
            display_name: displayName.trim() || slug.trim(),
            sort_order: sortOrder,
            enabled: true,
            fleet_type: fleetType,
            ceo_name: ceoName.trim(),
            ceo_discord_uid: ceoDiscordUid,
            quantity: quantity,
        });
        setSaving(false);
        if (err) {
            setError(err);
        } else {
            onClose();
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-md" onClick={onClose} />
            <motion.div
                className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/[0.07] bg-[#050B08] shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
            >
                <div className="p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight leading-none">Add Fleet Asset</h2>
                                <div className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest mt-1">
                                    Registry Configuration
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Main lookup */}
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                FleetYards Slug / Identifier
                            </label>
                            <div className="flex gap-2">
                                <input
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value);
                                        setValidation(null);
                                        setError("");
                                    }}
                                    placeholder="e.g. origin-jumpworks-890-jump"
                                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all"
                                />
                                <button
                                    onClick={handleValidate}
                                    disabled={validating || !slug.trim()}
                                    className="px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 text-white font-bold transition-all disabled:opacity-50 disabled:hover:bg-white/5 flex items-center gap-2 text-sm"
                                >
                                    {validating ? (
                                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                                    ) : (
                                        <Search size={16} className="text-emerald-500" />
                                    )}
                                    Validate
                                </button>
                            </div>

                            {/* Validation result */}
                            {validation && (
                                <div
                                    className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                                        validation.found
                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                            : "border-red-500/20 bg-red-500/10 text-red-400"
                                    }`}
                                >
                                    {validation.found ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    {validation.found
                                        ? `Found ${validation.type === "fleet" ? "Fleet" : "Ship Model"}: "${validation.fleet?.name || slug}"`
                                        : "Slug not found on FleetYards as a ship model or public fleet. Double-check the slug."}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Display Name
                            </label>
                            <input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Custom Display Name (optional)"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all"
                            />
                        </div>

                        {/* CO (Commanding Officer) Selector */}
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                CO (Commanding Officer)
                            </label>
                            <COSelector
                                valueName={ceoName}
                                valueDiscordUid={ceoDiscordUid}
                                teamMembers={teamMembers}
                                onChange={({ ceo_name, ceo_discord_uid }) => {
                                    setCeoName(ceo_name);
                                    setCeoDiscordUid(ceo_discord_uid);
                                }}
                                placeholder="Search or assign CO..."
                            />
                        </div>

                        {/* Fleet Type */}
                        <div>
                            <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Fleet Type
                            </label>
                            <select
                                value={fleetType}
                                onChange={(e) => setFleetType(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all cursor-pointer"
                            >
                                <option value="small" className="bg-[#050B08] text-white">
                                    Small
                                </option>
                                <option value="medium" className="bg-[#050B08] text-white">
                                    Medium
                                </option>
                                <option value="large" className="bg-[#050B08] text-white">
                                    Large
                                </option>
                                <option value="sub_capital" className="bg-[#050B08] text-white">
                                    Sub-Capital
                                </option>
                                <option value="capital" className="bg-[#050B08] text-white">
                                    Capital
                                </option>
                            </select>
                        </div>

                        {/* Quantity and Sort Order */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-white text-sm font-mono outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all text-center"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="flex pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !slug.trim()}
                                className="w-full py-4 mt-2 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-sm hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? "Registering..." : "Register Asset to Fleet"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ───────── Manage Members Modal ───────── */
function ManageMembersModal({ fleet, onClose }: { fleet: FleetConfigEntry; onClose: () => void }) {
    const [members, setMembers] = useState<FleetMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Inline editing states
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [updating, setUpdating] = useState(false);

    const requestMembers = async (): Promise<FleetMember[]> => {
        try {
            const res = await fetch(`/api/fleet-members?fleetId=${fleet.id}`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        setMembers(await requestMembers());
        setLoading(false);
    };

    // The modal is keyed by fleet id, so this runs once per fleet with loading already true
    useEffect(() => {
        requestMembers().then((list) => {
            setMembers(list);
            setLoading(false);
        });
    }, [fleet.id]);

    const handleAdd = async () => {
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/fleet-members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fleet_config_id: fleet.id, name: name.trim(), role: role.trim() || "Member" }),
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to add.");
                return;
            }
            setName("");
            setRole("");
            await fetchMembers();
        } catch {
            setError("Network error.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/fleet-members/${id}`, { method: "DELETE" });
        await fetchMembers();
    };

    const startEdit = (m: FleetMember) => {
        setEditingMemberId(m.id);
        setEditName(m.name);
        setEditRole(m.role || "Member");
        setError("");
    };

    const cancelEdit = () => {
        setEditingMemberId(null);
        setEditName("");
        setEditRole("");
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) {
            setError("Name is required.");
            return;
        }
        setUpdating(true);
        setError("");
        try {
            const res = await fetch(`/api/fleet-members/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim(), role: editRole.trim() }),
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || "Failed to update.");
                return;
            }
            cancelEdit();
            await fetchMembers();
        } catch {
            setError("Network error.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-md" onClick={onClose} />
            <motion.div
                className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-[#050B08]/90 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col max-h-[80vh] overflow-hidden"
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-white/[0.06] shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Users size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black uppercase tracking-tight text-white leading-none">Fleet Members</h2>
                        <div className="text-[10px] font-mono text-blue-400/50 uppercase tracking-widest mt-1 truncate">
                            {fleet.display_name || fleet.slug}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Members list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading && !updating ? (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                            <Loader2 size={20} className="animate-spin text-blue-400/50 mr-2" />
                            <span className="text-xs font-mono uppercase tracking-widest">Loading...</span>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-gray-600 text-xs font-mono uppercase tracking-widest">
                            No members yet. Add one below.
                        </div>
                    ) : (
                        members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-[10px] font-black uppercase">
                                    {m.name.charAt(0)}
                                </div>

                                {editingMemberId === m.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Name"
                                            className="flex-1 min-w-0 rounded-lg border border-blue-500/30 bg-black/40 px-2 py-1 text-white text-xs outline-none focus:border-blue-500"
                                        />
                                        <input
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            placeholder="Role"
                                            className="w-24 rounded-lg border border-blue-500/30 bg-black/40 px-2 py-1 text-white text-xs outline-none focus:border-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-white truncate">{m.name}</div>
                                        <div className="text-[10px] font-mono text-blue-400/60 uppercase tracking-widest">
                                            {m.role || "Member"}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    {editingMemberId === m.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdate(m.id)}
                                                disabled={updating}
                                                className="p-1 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                                title="Save changes"
                                            >
                                                <Save size={12} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
                                                title="Cancel"
                                            >
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(m)}
                                                className="p-1 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Edit member"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remove member"
                                            >
                                                <UserMinus size={13} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add member form */}
                <div className="p-4 border-t border-white/[0.06] shrink-0 space-y-3">
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            <AlertCircle size={12} /> {error}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder="Member name"
                            className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                        />
                        <input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder="Role (e.g. Pilot)"
                            className="w-28 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm transition-all disabled:opacity-50 shrink-0"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                            Add
                        </button>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600 text-center">
                        {members.length} member{members.length !== 1 ? "s" : ""} in this fleet
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ───────── Main Admin Page ───────── */
export default function FleetAdminPage() {
    const [configs, setConfigs] = useState<FleetConfigEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [authing, setAuthing] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [adminUser, setAdminUser] = useState<SessionUser | null>(null);
    const [searchQ, setSearchQ] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editId, setEditId] = useState<ConfigId | null>(null);
    const [editData, setEditData] = useState<Partial<FleetConfigEntry>>({});
    const [editSaving, setEditSaving] = useState(false);
    const [toggling, setToggling] = useState<ConfigId | null>(null);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"registry" | "about">("registry");

    // Drag-to-sort states
    const [dragId, setDragId] = useState<ConfigId | null>(null);
    const [dragOverId, setDragOverId] = useState<ConfigId | null>(null);
    const [sortSaving, setSortSaving] = useState(false);

    // Column sort states (Status, Class, CO Name, Asset ID / Fleet)
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const handleHeaderSort = (key: SortField) => {
        if (sortField === key) {
            if (sortDir === "asc") {
                setSortDir("desc");
            } else {
                setSortField(null);
                setSortDir("asc");
            }
        } else {
            setSortField(key);
            setSortDir("asc");
        }
    };

    // Member management states
    const [selectedFleetForMembers, setSelectedFleetForMembers] = useState<FleetConfigEntry | null>(null);
    const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        fetch("/api/team-members")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setTeamMembers(data);
            })
            .catch((err) => console.error("Failed to fetch team members for admin:", err));
    }, []);

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/fleet-configs");
            const data = await res.json();
            setConfigs(Array.isArray(data) ? data : []);

            // Fetch member counts
            const mRes = await fetch("/api/fleet-members");
            const mData: unknown = await mRes.json();
            if (Array.isArray(mData)) {
                const counts: Record<string, number> = {};
                (mData as FleetMember[]).forEach((m) => {
                    counts[m.fleet_config_id] = (counts[m.fleet_config_id] || 0) + 1;
                });
                setMemberCounts(counts);
            }
        } catch {
            setConfigs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadAdminSession = async () => {
            setAuthing(true);
            const deniedFromRedirect = window.location.search.includes("denied=1");
            const res = await fetch("/api/auth/discord/session?admin=1", { cache: "no-store" });
            const data = (await res.json().catch(() => ({}))) as Partial<SessionResponse>;
            if (!mounted) return;

            if (res.ok && data?.admin) {
                setAuthed(true);
                setAccessDenied(false);
                setAdminUser(data.user || null);
                await fetchConfigs();
            } else {
                setAuthed(false);
                setAccessDenied(res.status === 403 || deniedFromRedirect);
                setAdminUser(null);
                setConfigs([]);
                setLoading(false);
            }

            if (mounted) setAuthing(false);
        };

        loadAdminSession();

        return () => {
            mounted = false;
        };
    }, [fetchConfigs]);

    const handleLogout = async () => {
        await fetch("/api/auth/discord/logout", { method: "POST" });
        setAuthed(false);
        setAccessDenied(false);
        setAdminUser(null);
        setConfigs([]);
    };

    const handleAdd = async (form: NewFleetConfig) => {
        const res = await fetch("/api/fleet-configs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) return data.error || "Failed to add fleet.";
        await fetchConfigs();
        return null;
    };

    const handleToggle = async (cfg: FleetConfigEntry) => {
        setToggling(cfg.id);
        await fetch(`/api/fleet-configs/${cfg.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: !cfg.enabled }),
        });
        await fetchConfigs();
        setToggling(null);
    };

    const handleDelete = async (id: ConfigId, name: string) => {
        if (!confirm(`Remove "${name}" from the fleet registry?`)) return;
        await fetch(`/api/fleet-configs/${id}`, { method: "DELETE" });
        await fetchConfigs();
    };

    const startEdit = (cfg: FleetConfigEntry) => {
        setEditId(cfg.id);
        setEditData({ ...cfg });
    };
    const cancelEdit = () => {
        setEditId(null);
        setEditData({});
    };
    const handleEditChange = <K extends keyof FleetConfigEntry>(key: K, val: FleetConfigEntry[K]) =>
        setEditData((p) => ({ ...p, [key]: val }));

    const handleEditSave = async () => {
        setEditSaving(true);
        await fetch(`/api/fleet-configs/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editData),
        });
        cancelEdit();
        await fetchConfigs();
        setEditSaving(false);
    };

    /* ── Drag-to-sort handlers ── */
    const handleDragStart = (id: ConfigId) => setDragId(id);
    const handleDragOver = (id: ConfigId) => {
        if (id !== dragId) setDragOverId(id);
    };
    const handleDragEnd = () => {
        setDragId(null);
        setDragOverId(null);
    };

    const handleDrop = async (targetId: ConfigId) => {
        if (!dragId || dragId === targetId) {
            handleDragEnd();
            return;
        }
        // Reorder configs list
        const reordered = [...configs];
        const fromIdx = reordered.findIndex((c) => c.id === dragId);
        const toIdx = reordered.findIndex((c) => c.id === targetId);
        if (fromIdx === -1 || toIdx === -1) {
            handleDragEnd();
            return;
        }
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        // Assign sequential sort_order
        const updated = reordered.map((c, i) => ({ ...c, sort_order: i }));
        setConfigs(updated);
        handleDragEnd();
        // Persist only changed sort_orders
        setSortSaving(true);
        try {
            await Promise.all(
                updated
                    .filter((c, i) => configs[i]?.id !== c.id || configs.find((x) => x.id === c.id)?.sort_order !== c.sort_order)
                    .map((c) =>
                        fetch(`/api/fleet-configs/${c.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ sort_order: c.sort_order }),
                        }),
                    ),
            );
        } catch (e) {
            console.error("Sort save failed:", e);
        } finally {
            setSortSaving(false);
        }
    };

    const filtered = searchQ
        ? configs.filter((c) => [c.slug, c.display_name, c.ceo_name].join(" ").toLowerCase().includes(searchQ.toLowerCase()))
        : configs;

    const sortedFiltered = [...filtered].sort((a, b) => {
        if (!sortField) return 0;
        let valA: string | number = 0;
        let valB: string | number = 0;
        if (sortField === "slug") {
            valA = (a.display_name || a.slug || "").toLowerCase();
            valB = (b.display_name || b.slug || "").toLowerCase();
        } else if (sortField === "enabled") {
            valA = a.enabled ? 1 : 0;
            valB = b.enabled ? 1 : 0;
        } else if (sortField === "fleet_type") {
            const typeRank: Record<string, number> = { small: 1, medium: 2, large: 3, sub_capital: 4, capital: 5 };
            valA = typeRank[a.fleet_type ?? ""] || 0;
            valB = typeRank[b.fleet_type ?? ""] || 0;
        } else if (sortField === "ceo_name") {
            valA = (a.ceo_name || "").toLowerCase();
            valB = (b.ceo_name || "").toLowerCase();
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const enabledCount = configs.filter((c) => c.enabled).length;

    if (authing) return <AuthScreen />;
    if (accessDenied) return <DeniedScreen onLogout={handleLogout} />;
    if (!authed) return <LoginScreen onLogin={() => (window.location.href = "/api/auth/discord/login?returnTo=/fleet/admin")} />;

    return (
        <div className="min-h-[100dvh] bg-[#020402] text-white p-4 md:p-6 lg:p-8 relative overflow-hidden w-full">
            {/* Background Ambience */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>

            <div className="w-full relative z-10 flex flex-col min-h-[calc(100dvh-4rem)]">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <div className="flex items-center gap-3 text-[10px] font-mono font-black uppercase tracking-[0.35em] text-emerald-500 mb-2">
                            <Shield size={14} className="animate-pulse" /> KMHQ Secure
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-4">
                            {activeTab === "registry" ? (
                                <>
                                    Fleet <span className="text-emerald-500">Registry</span>
                                </>
                            ) : (
                                <>
                                    About <span className="text-emerald-500">News</span>
                                </>
                            )}
                        </h1>
                        <p className="text-gray-400 text-sm mt-3 max-w-xl leading-relaxed">
                            {activeTab === "registry"
                                ? "Manage the master list of approved ship configurations. Ships added here are deployed instantly to the public Fleet Command interface."
                                : "Manage news entries displayed on the About page. Changes will go live instantly."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchConfigs()}
                            disabled={loading}
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 text-white hover:bg-white/10 hover:border-emerald-500/30 transition-all disabled:opacity-50 group"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:text-emerald-400 transition-colors"} />
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                        >
                            <Plus size={18} /> New Asset
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/[0.07] pb-4 shrink-0">
                    <button
                        onClick={() => setActiveTab("registry")}
                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "registry" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"}`}
                    >
                        Fleet Registry
                    </button>
                    <button
                        onClick={() => setActiveTab("about")}
                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === "about" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"}`}
                    >
                        About News
                    </button>
                </div>

                {activeTab === "about" ? (
                    <AboutNewsEditor />
                ) : (
                    <>
                        {/* Filters and Stats Row */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                    placeholder="Search registry..."
                                    className="w-full rounded-full border border-white/10 bg-white/[0.02] pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all backdrop-blur-md"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col px-5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                                        Total Assets
                                    </span>
                                    <span className="text-white font-black text-lg leading-none">{configs.length}</span>
                                </div>
                                <div className="flex flex-col px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                                    <span className="text-[9px] font-mono font-bold text-emerald-500/70 uppercase tracking-widest">
                                        Active
                                    </span>
                                    <span className="text-emerald-400 font-black text-lg leading-none">{enabledCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Registry Table Container */}
                        <div className="flex-1 relative rounded-[2rem] border border-white/[0.07] bg-[#050B08]/80 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col">
                            {error && (
                                <div className="m-4 shrink-0 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-16 flex flex-col items-center justify-center text-gray-500 gap-4">
                                        <Loader2 size={32} className="animate-spin text-emerald-500/50" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">Accessing Registry Data...</span>
                                    </div>
                                ) : sortedFiltered.length === 0 ? (
                                    <div className="p-16 text-center text-gray-500">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Search size={24} className="text-gray-600" />
                                        </div>
                                        <p className="font-mono text-xs uppercase tracking-widest">No matching registry entries found.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="sticky top-0 bg-[#050B08]/90 backdrop-blur-md z-20 shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                                            <tr>
                                                <th className="pl-3 pr-0 py-4 w-8" />
                                                {[
                                                    { label: "Asset ID / Fleet", key: "slug" },
                                                    { label: "Status", key: "enabled" },
                                                    { label: "Class", key: "fleet_type" },
                                                    { label: "CO Name", key: "ceo_name" },
                                                ].map((col) => (
                                                    <th
                                                        key={col.key}
                                                        onClick={() => handleHeaderSort(col.key as SortField)}
                                                        className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold whitespace-nowrap cursor-pointer hover:text-emerald-400 transition-colors select-none"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>{col.label}</span>
                                                            {col.key === "slug" && sortSaving && (
                                                                <span className="text-emerald-500/60 font-mono normal-case tracking-normal">
                                                                    saving…
                                                                </span>
                                                            )}
                                                            {sortField === col.key ? (
                                                                sortDir === "asc" ? (
                                                                    <ArrowUp size={12} className="text-emerald-400" />
                                                                ) : (
                                                                    <ArrowDown size={12} className="text-emerald-400" />
                                                                )
                                                            ) : (
                                                                <ArrowUpDown
                                                                    size={10}
                                                                    className="opacity-40 hover:opacity-100 transition-opacity"
                                                                />
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold whitespace-nowrap select-none">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.04]">
                                            {sortedFiltered.map((cfg) =>
                                                editId === cfg.id ? (
                                                    <EditRow
                                                        key={cfg.id}
                                                        data={editData}
                                                        onChange={handleEditChange}
                                                        onSave={handleEditSave}
                                                        onCancel={cancelEdit}
                                                        saving={editSaving}
                                                        teamMembers={teamMembers}
                                                    />
                                                ) : (
                                                    <FleetRow
                                                        key={cfg.id}
                                                        cfg={cfg}
                                                        memberCount={memberCounts[String(cfg.id)] || 0}
                                                        onEdit={startEdit}
                                                        onDelete={handleDelete}
                                                        onToggle={handleToggle}
                                                        toggling={toggling}
                                                        onManageMembers={setSelectedFleetForMembers}
                                                        onDragStart={handleDragStart}
                                                        onDragOver={handleDragOver}
                                                        onDrop={handleDrop}
                                                        onDragEnd={handleDragEnd}
                                                        isDragOver={dragOverId === cfg.id}
                                                    />
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && <AddFleetModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} teamMembers={teamMembers} />}
                {selectedFleetForMembers && (
                    <ManageMembersModal
                        key={selectedFleetForMembers.id}
                        fleet={selectedFleetForMembers}
                        onClose={() => {
                            setSelectedFleetForMembers(null);
                            fetchConfigs();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
