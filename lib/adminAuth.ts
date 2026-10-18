import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "kmhq_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export function getEnvAdminDiscordIds() {
    return (process.env.ADMIN_DISCORD_IDS || process.env.DISCORD_ADMIN_IDS || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
}

export function isEnvAdminDiscordId(discordId) {
    if (!discordId) return false;
    return getEnvAdminDiscordIds().includes(String(discordId));
}

function getCookieSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function base64Url(input) {
    return Buffer.from(input).toString("base64url");
}

function signPayload(payload) {
    const secret = getCookieSecret();
    if (!secret) throw new Error("ADMIN_SESSION_SECRET or DISCORD_CLIENT_SECRET is required");
    return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session) {
    const payload = base64Url(JSON.stringify(session));
    return `${payload}.${signPayload(payload)}`;
}

function decodeSession(value) {
    if (!value || !value.includes(".")) return null;

    const [payload, signature] = value.split(".");
    const expected = signPayload(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session?.discordId || !session?.expiresAt || Date.now() > session.expiresAt) return null;
    return session;
}

export function setAdminSessionCookie(discordUser, response) {
    const session = {
        discordId: discordUser.id,
        username: discordUser.global_name || discordUser.username,
        avatar: discordUser.avatar,
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    };

    response.cookies.set({
        name: COOKIE_NAME,
        value: encodeSession(session),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
    });
}

export function clearAdminSessionCookie(response) {
    response.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export async function getAdminSession() {
    try {
        const cookieStore = await cookies();
        return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
    } catch {
        return null;
    }
}

export async function getAdminFromDiscordId(discordId) {
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

export async function requireFleetAdmin() {
    const session = await getAdminSession();
    if (!session) return { ok: false, status: 401, error: "Not signed in" };

    const admin = await getAdminFromDiscordId(session.discordId);
    if (!admin) return { ok: false, status: 403, error: "Admin access required" };

    return { ok: true, session, admin };
}
