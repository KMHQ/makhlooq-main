import { Crown, Shield, Sword, Terminal, Users, Zap, type LucideIcon } from "lucide-react";
import type { MemberAward } from "@/lib/discord";

export type { MemberAward };

// Military ranks, highest first
export const CATEGORIES = [
    "Field Marshal",
    "General",
    "Commander",
    "Colonel",
    "Major",
    "Captain",
    "Officer",
    "Lieutenant",
    "Sergeant",
    "Corporal",
    "Soldier",
    "Citizen",
    "Makhlooq",
];

export const RANK_ORDER: Record<string, number> = Object.fromEntries(CATEGORIES.map((rank, i) => [rank, i + 1]));

export const SEC_LEVELS = ["R0", "R1", "R2", "R3", "R4", "R5", "R6"];

export const PRESET_COLORS = [
    "#10b981",
    "#34d399",
    "#6ee7b7",
    "#a78bfa",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#8b5cf6",
];

export const STATUS_COLORS: Record<string, string> = { active: "#22c55e", inactive: "#6b7280" };

export const STATUS_META: Record<string, { color: string; label: string; dot: string }> = {
    active: { color: "#00ff41", label: "ACTIVE", dot: "bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse" },
    inactive: { color: "#2a3a2a", label: "INACTIVE", dot: "bg-[#1a3020]" },
};

const ICON_MAP: Record<string, LucideIcon> = {
    crown: Crown,
    shield: Shield,
    sword: Sword,
    users: Users,
    zap: Zap,
    terminal: Terminal,
};

// Icon, accent color and label for a member's flair/role text
export function getRoleConfig(role: string | null | undefined): { Icon: LucideIcon; accent: string; label: string } {
    const r = role?.toLowerCase() || "";
    if (r.includes("founder") || r.includes("quaid") || r.includes("admiral")) return { Icon: Crown, accent: "#fbbf24", label: "FOUNDER" };
    if (r.includes("council")) return { Icon: Shield, accent: "#f87171", label: "COUNCIL" };
    if (r.includes("advisor")) return { Icon: Terminal, accent: "#60a5fa", label: "ADVISOR" };
    if (r.includes("kmhq")) return { Icon: Zap, accent: "#10b981", label: "KMHQ" };
    return { Icon: Users, accent: "#00ff41", label: "CREW" };
}

// The member's chosen flair icon, or the role's default ("none" hides it)
export function getFlairIcon(flairIcon: string | null | undefined, fallback: LucideIcon): LucideIcon | null {
    if (flairIcon === "none") return null;
    return ICON_MAP[flairIcon?.toLowerCase() ?? ""] || fallback;
}

export const AWARD_TIERS: Record<string, { label: string; merits: string; suffix: string }> = {
    Ustad: { label: "Ustad (19 Merits)", merits: "19 Merits", suffix: "_1" },
    Uncle: { label: "Uncle (13 Merits)", merits: "13 Merits", suffix: "_2" },
    Launda: { label: "Launda (7 Merits)", merits: "7 Merits", suffix: "_3" },
    Charsi: { label: "Charsi (3 Merits)", merits: "3 Merits", suffix: "_4" },
};

export const AWARD_CATEGORIES: Record<string, { label: string; filePrefix: string; desc: string }> = {
    Shaqafat: {
        label: "Shaqafat (Valor & Combat)",
        filePrefix: "Shaqafat",
        desc: "For unmatched bravery and domination in battle, defending the fleet and seizing victory.",
    },
    Safir: {
        label: "Safir (Navigations)",
        filePrefix: "safir",
        desc: "For exceptional navigation and piloting, ensuring mission success and survival against the odds.",
    },
    Ittehad: {
        label: "Ittehad (Teamwork)",
        filePrefix: "ittehad",
        desc: "For outstanding teamwork and leadership in major operations, keeping the fleet united under fire.",
    },
    Khidmat: {
        label: "Khidmat (Service & Dedication)",
        filePrefix: "khidmat",
        desc: "For unwavering commitment and selfless contributions to the fleet's goals and welfare.",
    },
    Alamgiri: {
        label: "Alamgiri (Strategist)",
        filePrefix: "alamgiri",
        desc: "For significant strides in developing the RoE and the fleet's strategic backbone and operation SOPs.",
    },
    Sultani: {
        label: "Sultani (Diplomacy)",
        filePrefix: "sultani",
        desc: "For forging alliances, discovering uncharted systems, and expanding the influence of Khalai Makhlooq.",
    },
    Khazana: {
        label: "Khazana (Generosity)",
        filePrefix: "khazana",
        desc: "For significant material or financial support that empowers the fleet’s strength and survival.",
    },
    Rehla: { label: "Rehla (Discovery)", filePrefix: "rehla", desc: "For discovering new systems, planets, and starpaths." },
    Naqsha: { label: "Naqsha (Exploration & Mapping)", filePrefix: "naqsha", desc: "For mapping valuable zones and hidden resources." },
    Shaheen: { label: "Shaheen (Ariel Dominance)", filePrefix: "shaheen", desc: "For aerial dominance and unmatched dogfighting." },
    Sipar: { label: "Sipar (Defense)", filePrefix: "sipar", desc: "For defending vital assets and comrades against overwhelming odds." },
    Bandook: {
        label: "Bandook (High Value Kills)",
        filePrefix: "bandook",
        desc: "For elite marksmanship and critical kills in combat, clearing the field of threats.",
    },
    Nusrat: { label: "Nusrat (Medical Support)", filePrefix: "nusrat", desc: "For life-saving medical, logistical, and morale support." },
    Mistri: { label: "Mistri (Engineering Support)", filePrefix: "mistri", desc: "For engineering support under enemy fire." },
};

// Members' `awards` column is untyped JSON; keep only well-formed entries.
export function parseAwards(value: unknown): MemberAward[] {
    if (!Array.isArray(value)) return [];
    return value.filter(
        (a): a is MemberAward => typeof a === "object" && a !== null && typeof a.category === "string" && typeof a.tier === "string",
    );
}

export function getAwardImage(category: string, tier: string) {
    const prefix = AWARD_CATEGORIES[category]?.filePrefix;
    const suffix = AWARD_TIERS[tier]?.suffix;
    return prefix && suffix ? `/KMHQ Awards/${prefix}${suffix}.png` : null;
}

export function formatDate(date: string | null | undefined) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
