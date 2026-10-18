import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "./supabase";
import type { DiscordUser } from "./discord";
import type { TeamMember } from "@/types/db";

const COOKIE_NAME = "kmhq_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AdminSession {
    discordId: string;
    username: string;
    avatar: string | null;
    expiresAt: number;
}

type Admin = Pick<TeamMember, "discord_uid" | "discord_tag" | "name" | "avatar_url" | "is_admin"> & { source?: "env" };

export type AdminCheck = { ok: true; session: AdminSession; admin: Admin } | { ok: false; status: 401 | 403; error: string };

function getEnvAdminDiscordIds() {
    return (process.env.ADMIN_DISCORD_IDS || process.env.DISCORD_ADMIN_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

export function isEnvAdminDiscordId(discordId: string | null | undefined) {
    if (!discordId) return false;
    return getEnvAdminDiscordIds().includes(String(discordId));
}

function signPayload(payload: string) {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new Error("ADMIN_SESSION_SECRET or DISCORD_CLIENT_SECRET is required");
    return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session: AdminSession) {
    const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
    return `${payload}.${signPayload(payload)}`;
}

function decodeSession(value: string | undefined): AdminSession | null {
    if (!value || !value.includes(".")) return null;

    const [payload, signature] = value.split(".");
    const a = Buffer.from(signature);
    const b = Buffer.from(signPayload(payload));

    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (!session.discordId || !session.expiresAt || Date.now() > session.expiresAt) return null;
    return session as AdminSession;
}

const cookieOptions = {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
} as const;

export function setAdminSessionCookie(discordUser: DiscordUser, response: NextResponse) {
    const session: AdminSession = {
        discordId: discordUser.id,
        username: discordUser.global_name || discordUser.username,
        avatar: discordUser.avatar,
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    };

    response.cookies.set({ ...cookieOptions, value: encodeSession(session), maxAge: SESSION_TTL_SECONDS });
}

export function clearAdminSessionCookie(response: NextResponse) {
    response.cookies.set({ ...cookieOptions, value: "", maxAge: 0 });
}

export async function getAdminSession() {
    try {
        const cookieStore = await cookies();
        return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
    } catch {
        return null;
    }
}

export async function getAdminFromDiscordId(discordId: string | null | undefined): Promise<Admin | null> {
    if (!discordId) return null;

    if (isEnvAdminDiscordId(discordId)) {
        return {
            discord_uid: discordId,
            discord_tag: null,
            name: "Environment Admin",
            avatar_url: null,
            is_admin: true,
            source: "env",
        };
    }

    const { data } = await supabase
        .from("team_members")
        .select("discord_uid, discord_tag, name, avatar_url, is_admin")
        .eq("discord_uid", discordId)
        .maybeSingle();

    return data?.is_admin ? data : null;
}

export async function requireFleetAdmin(): Promise<AdminCheck> {
    const session = await getAdminSession();
    if (!session) return { ok: false, status: 401, error: "Not signed in" };

    const admin = await getAdminFromDiscordId(session.discordId);
    if (!admin) return { ok: false, status: 403, error: "Admin access required" };

    return { ok: true, session, admin };
}
