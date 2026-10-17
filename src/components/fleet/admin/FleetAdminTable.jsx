"use client";
import { useState } from "react";
import { Edit3, Trash2, Save, X, ChevronDown } from "lucide-react";

const MESH_TYPES = ["capital", "fighter", "explorer", "medium", "industrial", "luxury"];

function EditableField({ value, onChange, placeholder, mono = false, type = "text" }) {
    return (
        <input
            type={type}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-lg border border-emerald-500/20 bg-white/5 px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50 transition-colors ${mono ? "font-mono" : ""}`}
        />
    );
}

function ShipRow({ ship, onEdit, onDelete }) {
    return (
        <tr className="group hover:bg-white/[0.02] transition-colors">
            {/* Ship */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    {ship.thumbnail ? (
                        <img
                            src={ship.thumbnail}
                            alt={ship.name}
                            className="w-10 h-7 rounded object-cover border border-white/10 shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-7 rounded bg-white/5 border border-white/5 shrink-0" />
                    )}
                    <div>
                        <div className="text-white font-bold text-sm">{ship.name}</div>
                        <div className="text-gray-600 text-[10px] font-mono">{ship.manufacturer}</div>
                    </div>
                </div>
            </td>
            {/* Class/Role */}
            <td className="px-5 py-4">
                <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider">{ship.ship_class}</div>
                <div className="text-gray-600 text-[10px]">{ship.role}</div>
            </td>
            {/* Mesh */}
            <td className="px-5 py-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {ship.mesh_type || "—"}
                </span>
            </td>
            {/* Model */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ship.model_path ? "bg-green-400" : "bg-yellow-500"}`} />
                    <span className="text-xs font-mono text-gray-400 truncate max-w-[130px]">{ship.model_path || "Placeholder"}</span>
                </div>
            </td>
            {/* Accent */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-white/10 shrink-0" style={{ background: ship.accent_color }} />
                    <span className="text-gray-600 text-[10px] font-mono">{ship.accent_color}</span>
                </div>
            </td>
            {/* Actions */}
            <td className="px-5 py-4">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(ship)}
                        className="p-2 rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title="Edit"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(ship.id)}
                        className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function EditRow({ data, onChange, onSave, onCancel, saving }) {
    return (
        <tr className="bg-emerald-500/[0.03] border-l-2 border-l-emerald-500">
            <td className="px-5 py-3">
                <div className="space-y-1.5">
                    <EditableField value={data.name} onChange={(v) => onChange("name", v)} placeholder="Ship Name" />
                    <EditableField value={data.manufacturer} onChange={(v) => onChange("manufacturer", v)} placeholder="Manufacturer" />
                    <EditableField
                        value={data.thumbnail}
                        onChange={(v) => onChange("thumbnail", v)}
                        placeholder="/backgrounds/thumb.png"
                        mono
                    />
                </div>
            </td>
            <td className="px-5 py-3">
                <div className="space-y-1.5">
                    <EditableField value={data.ship_class} onChange={(v) => onChange("ship_class", v)} placeholder="Class" />
                    <EditableField value={data.role} onChange={(v) => onChange("role", v)} placeholder="Role" />
                </div>
            </td>
            <td className="px-5 py-3">
                <select
                    value={data.mesh_type || "medium"}
                    onChange={(e) => onChange("mesh_type", e.target.value)}
                    className="w-full rounded-lg border border-emerald-500/20 bg-[#040c08] px-3 py-1.5 text-white text-xs outline-none focus:border-emerald-500/50"
                >
                    {MESH_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-5 py-3">
                <EditableField value={data.model_path} onChange={(v) => onChange("model_path", v)} placeholder="/models/ship.glb" mono />
            </td>
            <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={data.accent_color || "#10b981"}
                        onChange={(e) => onChange("accent_color", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="text-[10px] font-mono text-gray-500">{data.accent_color}</span>
                </div>
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

export default function FleetAdminTable({ ships, loading, onDelete, onSave }) {
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    const startEdit = (ship) => {
        setEditId(ship.id);
        setEditData({ ...ship });
    };
    const cancelEdit = () => {
        setEditId(null);
        setEditData({});
    };

    const handleChange = (key, val) => setEditData((p) => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        await onSave(editId, editData);
        cancelEdit();
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this ship from the fleet registry?")) return;
        await onDelete(id);
    };

    return (
        <div className="rounded-3xl border border-white/5 bg-[#040c08]/40 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Ship", "Class / Role", "Mesh Type", "Model", "Accent", "Actions"].map((h) => (
                                <th
                                    key={h}
                                    className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-20 text-center text-gray-600 font-mono text-xs uppercase tracking-widest animate-pulse"
                                >
                                    Loading Fleet Registry…
                                </td>
                            </tr>
                        ) : ships.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest"
                                >
                                    No ships found
                                </td>
                            </tr>
                        ) : (
                            ships.map((ship) =>
                                editId === ship.id ? (
                                    <EditRow
                                        key={ship.id}
                                        data={editData}
                                        onChange={handleChange}
                                        onSave={handleSave}
                                        onCancel={cancelEdit}
                                        saving={saving}
                                    />
                                ) : (
                                    <ShipRow key={ship.id} ship={ship} onEdit={startEdit} onDelete={handleDelete} />
                                ),
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
