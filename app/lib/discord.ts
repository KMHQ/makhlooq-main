/**
 * Discord API Utility
 * Uses the bot token to fetch server data and map roles automatically
 */

import { cacheLife, cacheTag } from "next/cache";
import { isEnvAdminDiscordId } from "./adminAuth";

export interface DiscordUser {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
    discriminator?: string;
    bot?: boolean;
}

export interface DiscordGuildMember {
    user: DiscordUser;
    nick: string | null;
    roles: string[];
    joined_at: string;
}

export interface DiscordRole {
    id: string;
    name: string;
}

// A type alias (not interface) so it stays assignable to the JSON awards column.
export type MemberAward = {
    category: string;
    tier: string;
};

const getBotToken = () => process.env.DISCORD_BOT_TOKEN;
const getGuildId = () => process.env.DISCORD_GUILD_ID;

// Clearance levels, lowest to highest: the last match wins.
const CLEARANCE_ROLES = [
    { id: "1370432627814961212", name: "R0" },
    { id: "1364662076013940841", name: "R1" },
    { id: "1364662156850761890", name: "R2" },
    { id: "1362418699377709299", name: "R3" },
    { id: "1362415755009986790", name: "R4" },
    { id: "1364662461365751989", name: "R5" },
    { id: "1362416160787791993", name: "R6" },
] as const;

// Military ranks, highest first: the first match wins.
const RANK_ROLES = [
    { id: "1370438091613016135", name: "Field Marshal" },
    { id: "1370437141452030102", name: "General" },
    { id: "1370436925537910936", name: "Commander" },
    { id: "1370436793568071823", name: "Colonel" },
    { id: "1370436727675551825", name: "Major" },
    { id: "1370436614605766799", name: "Captain" },
    { id: "1370436510762930279", name: "Lieutenant" },
    { id: "1370436389052874752", name: "Officer" },
    { id: "1370436217828540638", name: "Sergeant" },
    { id: "1370436139952902174", name: "Corporal" },
    { id: "1370436042544644288", name: "Soldier" },
    { id: "1370435922730156093", name: "Citizen" },
    { id: "1370486810832273489", name: "Makhlooq" },
] as const;

export const KMHQ_ROLE_ID = "1409930627704164493";

// Leadership role IDs -> flair, in display priority order.
const LEADERSHIP_ROLES: Record<string, string> = {
    "1364677903995900097": "Quaid - Founder",
    "1365424506507890771": "High Council",
    "1365424626276241470": "Advisor",
    [KMHQ_ROLE_ID]: "KMHQ",
};
const LEADERSHIP_PRIORITY = ["Quaid - Founder", "High Council", "Advisor", "KMHQ"];

const TIER_RANKING: Record<string, number> = { Ustad: 4, Uncle: 3, Launda: 2, Charsi: 1 };

async function getGuildMembers(): Promise<DiscordGuildMember[]> {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("discord");

    const response = await fetch(`https://discord.com/api/v10/guilds/${getGuildId()}/members?limit=1000`, {
        headers: { Authorization: `Bot ${getBotToken()}` },
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string; code?: number } | null;
        const detail = body?.message ? ` - ${body.message} (code ${body.code})` : "";
        throw new Error(`Discord API error: ${response.status} ${response.statusText}${detail}`);
    }

    return response.json();
}

async function getGuildRoles(): Promise<DiscordRole[]> {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("discord");

    try {
        const response = await fetch(`https://discord.com/api/v10/guilds/${getGuildId()}/roles`, {
            headers: { Authorization: `Bot ${getBotToken()}` },
        });
        if (!response.ok) throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch Discord roles:", error);
        return [];
    }
}

export async function fetchDiscordMembers(): Promise<DiscordGuildMember[]> {
    if (!getBotToken() || !getGuildId()) {
        console.warn("Discord Bot Token or Guild ID missing");
        return [];
    }

    return getGuildMembers();
}

export async function fetchDiscordRoles(): Promise<DiscordRole[]> {
    if (!getBotToken() || !getGuildId()) {
        console.warn("Discord Bot Token or Guild ID missing");
        return [];
    }

    return getGuildRoles();
}

/**
 * Parses member roles to auto-determine:
 * - sec_level (R0 - R6)
 * - category (Rank)
 * - role (Leadership / Flair)
 * - is_admin (boolean)
 * - awards ([{ category, tier }])
 */
export function parseMemberRoles(userRoleIds: string[] = [], rolesMap = new Map<string, DiscordRole>(), discordUid = "") {
    const sec_level = CLEARANCE_ROLES.findLast((c) => userRoleIds.includes(c.id))?.name ?? "R0";
    const category = RANK_ROLES.find((r) => userRoleIds.includes(r.id))?.name ?? "Makhlooq";

    const leadership = userRoleIds
        .map((roleId) => LEADERSHIP_ROLES[roleId])
        .filter((role): role is string => Boolean(role))
        .sort((a, b) => LEADERSHIP_PRIORITY.indexOf(a) - LEADERSHIP_PRIORITY.indexOf(b));
    const role = leadership.length > 0 ? leadership.join(", ") : "KMHQ";

    // Admin status: ONLY granted for R6 clearance or explicit env admin ID
    const is_admin = sec_level === "R6" || isEnvAdminDiscordId(discordUid);

    // Awards come from roles named "<Tier>-e-<Category>"; keep the highest tier per category.
    const categoryAwards: Record<string, string> = {};
    for (const roleId of userRoleIds) {
        const match = rolesMap.get(roleId)?.name.match(/^(Ustad|Uncle|Launda|Charsi)-e-([A-Za-z]+)$/i);
        if (!match) continue;

        const tier = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        let cat = match[2].charAt(0).toUpperCase() + match[2].slice(1);
        if (cat.toLowerCase() === "rihla") cat = "Rehla";

        if ((TIER_RANKING[tier] ?? 0) > (TIER_RANKING[categoryAwards[cat]] ?? 0)) {
            categoryAwards[cat] = tier;
        }
    }

    const awards: MemberAward[] = Object.entries(categoryAwards).map(([category, tier]) => ({ category, tier }));

    return { sec_level, category, role, is_admin, awards };
}
