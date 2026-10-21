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
import type { FleetMember, TeamMember } from "@/payload-types";
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
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                enabled ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-gray-500"
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "animate-pulse bg-emerald-400" : "bg-gray-600"}`} />
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
            className={`group cursor-grab transition-colors active:cursor-grabbing ${
                isDragOver ? "border-t-2 border-emerald-500/50 bg-emerald-500/[0.06]" : "hover:bg-white/[0.02]"
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
            <td className="w-8 py-5 pl-3 pr-0">
                <div className="flex cursor-grab flex-col gap-0.5 opacity-30 transition-opacity group-hover:opacity-70">
                    <div className="h-0.5 w-4 rounded bg-white/60" />
                    <div className="h-0.5 w-4 rounded bg-white/60" />
                    <div className="h-0.5 w-3 rounded bg-white/40" />
                </div>
            </td>
            <td className="px-5 py-5">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-wide text-white">{cfg.display_name || cfg.slug}</span>
                    <a
                        href={getFleetyardsUrl(cfg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-fit items-center gap-1.5 font-mono text-[10px] text-gray-500 transition-colors hover:text-emerald-400"
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
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${["sub_capital", "capital"].includes(cfg.fleet_type ?? "") ? "border border-lime-400/20 bg-lime-400/10 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.1)]" : "border border-white/10 bg-white/5 text-gray-400"}`}
                >
                    {(cfg.fleet_type || "small").replace("_", "-")}
                </span>
            </td>
            <td className="px-5 py-5">
                <span className="block max-w-[120px] truncate text-xs font-medium text-gray-300">{cfg.ceo_name || "—"}</span>
            </td>
            <td className="px-5 py-5">
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => onToggle(cfg)}
                        disabled={toggling === cfg.id}
                        title={cfg.enabled ? "Disable fleet" : "Enable fleet"}
                        className="rounded-lg border border-white/10 p-2 text-gray-400 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
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
                        className="rounded-lg border border-blue-500/20 p-2 text-blue-400 transition-all hover:bg-blue-500/10"
                    >
                        <Users size={14} />
                    </button>
                    <button
                        onClick={() => onEdit(cfg)}
                        title="Edit"
                        className="rounded-lg border border-emerald-500/20 p-2 text-emerald-400 transition-all hover:bg-emerald-500/10"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(cfg.id, cfg.display_name || cfg.slug)}
                        title="Remove"
                        className="rounded-lg border border-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/10"
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
        <tr className="relative z-10 border-y border-emerald-500/20 bg-emerald-500/[0.03] shadow-[inset_4px_0_0_rgba(16,185,129,1)]">
            <td className="w-8 py-3 pl-3 pr-0" /> {/* drag handle placeholder */}
            <td className="px-5 py-3">
                <div className="space-y-1.5">
                    <input
                        value={data.slug || ""}
                        onChange={(e) => onChange("slug", e.target.value)}
                        placeholder="fleetyards-slug"
                        className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 font-mono text-xs text-white outline-none transition-colors focus:border-emerald-500/50"
                    />
                    <input
                        value={data.display_name || ""}
                        onChange={(e) => onChange("display_name", e.target.value)}
                        placeholder="Display Name"
                        className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-xs text-white outline-none transition-colors focus:border-emerald-500/50"
                    />
                </div>
            </td>
            <td className="px-5 py-3">
                <label className="flex cursor-pointer items-center gap-2">
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
                    className="w-full rounded-lg border border-emerald-500/20 bg-white/5 px-2 py-1.5 text-xs text-white outline-none transition-colors focus:border-emerald-500/50"
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
                        className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
                    >
                        <Save size={12} /> {saving ? "…" : "Save"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-400 transition-all hover:bg-white/5"
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
                className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/[0.07] bg-[#050B08] shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
            >
                <div className="p-8">
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-lg border border-white/10 p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <X size={16} />
                    </button>

                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase leading-none tracking-tight">Add Fleet Asset</h2>
                                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-emerald-500/50">
                                    Registry Configuration
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Main lookup */}
                        <div>
                            <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
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
                                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
                                />
                                <button
                                    onClick={handleValidate}
                                    disabled={validating || !slug.trim()}
                                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition-all hover:border-emerald-500/30 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
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
                                    className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
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
                            <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Display Name
                            </label>
                            <input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Custom Display Name (optional)"
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
                            />
                        </div>

                        {/* CO (Commanding Officer) Selector */}
                        <div>
                            <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
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
                            <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Fleet Type
                            </label>
                            <select
                                value={fleetType}
                                onChange={(e) => setFleetType(e.target.value)}
                                className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
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
                                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center font-mono text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center font-mono text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/5"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="flex pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || !slug.trim()}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
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
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
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
                body: JSON.stringify({ fleet_config: fleet.id, name: name.trim(), role: role.trim() || "Member" }),
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

    const handleDelete = async (id: number) => {
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

    const handleUpdate = async (id: number) => {
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
                className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#050B08]/90 shadow-[0_0_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-3xl"
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                        <Users size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-black uppercase leading-none tracking-tight text-white">Fleet Members</h2>
                        <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-widest text-blue-400/50">
                            {fleet.display_name || fleet.slug}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/10 p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Members list */}
                <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-4">
                    {loading && !updating ? (
                        <div className="flex items-center justify-center py-8 text-gray-500">
                            <Loader2 size={20} className="mr-2 animate-spin text-blue-400/50" />
                            <span className="font-mono text-xs uppercase tracking-widest">Loading...</span>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="py-8 text-center font-mono text-xs uppercase tracking-widest text-gray-600">
                            No members yet. Add one below.
                        </div>
                    ) : (
                        members.map((m) => (
                            <div
                                key={m.id}
                                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 transition-all hover:bg-white/[0.04]"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-[10px] font-black uppercase text-blue-400">
                                    {m.name.charAt(0)}
                                </div>

                                {editingMemberId === m.id ? (
                                    <div className="flex flex-1 gap-2">
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Name"
                                            className="min-w-0 flex-1 rounded-lg border border-blue-500/30 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                        />
                                        <input
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            placeholder="Role"
                                            className="w-24 rounded-lg border border-blue-500/30 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-bold text-white">{m.name}</div>
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-blue-400/60">
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
                                                className="rounded-lg border border-emerald-500/20 p-1 text-emerald-400 transition-all hover:bg-emerald-500/10"
                                                title="Save changes"
                                            >
                                                <Save size={12} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="rounded-lg border border-white/10 p-1 text-gray-400 transition-all hover:bg-white/5"
                                                title="Cancel"
                                            >
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(m)}
                                                className="rounded-lg border border-blue-500/20 p-1 text-blue-400 opacity-0 transition-all hover:bg-blue-500/10 group-hover:opacity-100"
                                                title="Edit member"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                className="rounded-lg border border-red-500/20 p-1.5 text-red-400 opacity-0 transition-all hover:bg-red-500/10 group-hover:opacity-100"
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
                <div className="shrink-0 space-y-3 border-t border-white/[0.06] p-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
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
                            className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/5"
                        />
                        <input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            placeholder="Role (e.g. Pilot)"
                            className="w-28 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/5"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={saving || !name.trim()}
                            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-400 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                            Add
                        </button>
                    </div>
                    <div className="text-center font-mono text-[10px] text-gray-600">
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
                    // The API returns depth 0, so fleet_config is the config's id
                    const fleetId = typeof m.fleet_config === "number" ? m.fleet_config : m.fleet_config.id;
                    counts[fleetId] = (counts[fleetId] || 0) + 1;
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
        <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#020402] p-4 text-white md:p-6 lg:p-8">
            {/* Background Ambience */}
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>

            <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] w-full flex-col">
                {/* Header Section */}
                <div className="mb-8 flex shrink-0 flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-3 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">
                            <Shield size={14} className="animate-pulse" /> KMHQ Secure
                        </div>
                        <h1 className="flex items-center gap-4 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
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
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
                            {activeTab === "registry"
                                ? "Manage the master list of approved ship configurations. Ships added here are deployed instantly to the public Fleet Command interface."
                                : "Manage news entries displayed on the About page. Changes will go live instantly."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchConfigs()}
                            disabled={loading}
                            className="group flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition-all hover:border-emerald-500/30 hover:bg-white/10 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : "transition-colors group-hover:text-emerald-400"} />
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                        >
                            <Plus size={18} /> New Asset
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex shrink-0 gap-2 border-b border-white/[0.07] pb-4">
                    <button
                        onClick={() => setActiveTab("registry")}
                        className={`rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "registry" ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border border-transparent text-gray-500 hover:bg-white/5 hover:text-white"}`}
                    >
                        Fleet Registry
                    </button>
                    <button
                        onClick={() => setActiveTab("about")}
                        className={`rounded-lg px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "about" ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border border-transparent text-gray-500 hover:bg-white/5 hover:text-white"}`}
                    >
                        About News
                    </button>
                </div>

                {activeTab === "about" ? (
                    <AboutNewsEditor />
                ) : (
                    <>
                        {/* Filters and Stats Row */}
                        <div className="mb-6 flex shrink-0 flex-col justify-between gap-4 md:flex-row">
                            <div className="relative max-w-sm flex-1">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={searchQ}
                                    onChange={(e) => setSearchQ(e.target.value)}
                                    placeholder="Search registry..."
                                    className="w-full rounded-full border border-white/10 bg-white/[0.02] py-2.5 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-md transition-all focus:border-emerald-500/50 focus:bg-white/[0.05]"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-2 backdrop-blur-md">
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                        Total Assets
                                    </span>
                                    <span className="text-lg font-black leading-none text-white">{configs.length}</span>
                                </div>
                                <div className="flex flex-col rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 backdrop-blur-md">
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">
                                        Active
                                    </span>
                                    <span className="text-lg font-black leading-none text-emerald-400">{enabledCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Registry Table Container */}
                        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#050B08]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl">
                            {error && (
                                <div className="m-4 flex shrink-0 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="custom-scrollbar flex-1 overflow-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center gap-4 p-16 text-gray-500">
                                        <Loader2 size={32} className="animate-spin text-emerald-500/50" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">Accessing Registry Data...</span>
                                    </div>
                                ) : sortedFiltered.length === 0 ? (
                                    <div className="p-16 text-center text-gray-500">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                            <Search size={24} className="text-gray-600" />
                                        </div>
                                        <p className="font-mono text-xs uppercase tracking-widest">No matching registry entries found.</p>
                                    </div>
                                ) : (
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead className="sticky top-0 z-20 bg-[#050B08]/90 shadow-[0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
                                            <tr>
                                                <th className="w-8 py-4 pl-3 pr-0" />
                                                {[
                                                    { label: "Asset ID / Fleet", key: "slug" },
                                                    { label: "Status", key: "enabled" },
                                                    { label: "Class", key: "fleet_type" },
                                                    { label: "CO Name", key: "ceo_name" },
                                                ].map((col) => (
                                                    <th
                                                        key={col.key}
                                                        onClick={() => handleHeaderSort(col.key as SortField)}
                                                        className="cursor-pointer select-none whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-emerald-400"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span>{col.label}</span>
                                                            {col.key === "slug" && sortSaving && (
                                                                <span className="font-mono normal-case tracking-normal text-emerald-500/60">
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
                                                                    className="opacity-40 transition-opacity hover:opacity-100"
                                                                />
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="select-none whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
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
