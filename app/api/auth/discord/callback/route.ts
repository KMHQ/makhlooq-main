import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { clearAdminSessionCookie, isEnvAdminDiscordId, setAdminSessionCookie } from "@/lib/adminAuth";
import { KMHQ_ROLE_ID, type DiscordUser } from "@/lib/discord";
import { supabase } from "@/lib/supabase";

function sanitizeReturnTo(value: string | undefined) {
    return value && value.startsWith("/") && !value.startsWith("//") ? value : "/team";
}

function redirectTo(request: NextRequest, returnTo: string, params: Record<string, string> = {}) {
    const baseUrl = getBaseUrl(request);
    const url = new URL(sanitizeReturnTo(returnTo), baseUrl);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return NextResponse.redirect(url);
}

function requiresAdmin(returnTo: string) {
    return ["/fleet/admin", "/team/admin"].some((path) => sanitizeReturnTo(returnTo).startsWith(path));
}

function getBaseUrl(request: NextRequest) {
    return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

async function exchangeCode(request: NextRequest, code: string): Promise<{ access_token: string }> {
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = `${getBaseUrl(request)}/api/auth/discord/callback`;

    if (!clientId || !clientSecret) {
        throw new Error("DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are required");
    }

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
    });

    if (!tokenRes.ok) throw new Error(`Discord token exchange failed: ${tokenRes.status}`);
    return tokenRes.json();
}

async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) throw new Error(`Discord user lookup failed: ${userRes.status}`);
    return userRes.json();
}

async function isGuildMember(discordId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!botToken || !guildId) {
        console.warn("Discord Bot Token or Guild ID is missing in environment. Allowing login.");
        return true;
    }

    try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
            headers: { Authorization: `Bot ${botToken}` },
        });

        if (res.ok) {
            const memberData = (await res.json().catch(() => ({}))) as { roles?: string[] };
            if (Array.isArray(memberData.roles) && !memberData.roles.includes(KMHQ_ROLE_ID)) {
                console.log(`User ${discordId} is in Discord guild but missing KMHQ role (${KMHQ_ROLE_ID}).`);
                return false;
            }
            return true;
        }

        const data = (await res.json().catch(() => ({}))) as { code?: number; message?: string };

        // Code 10007 means the member is not in the guild
        if (res.status === 404 && data.code === 10007) {
            console.log(`User ${discordId} is not a member of the Discord guild.`);
            return false;
        }

        // Any other error (like Unknown Guild 10004 or 401/403) is a bot setup issue.
        // Allow login to prevent locking everyone out.
        console.warn(
            `Discord bot check failed with status ${res.status} (code: ${data.code}, message: ${data.message}). Falling back to allowing access.`,
        );
        return true;
    } catch (err) {
        console.error("Failed to contact Discord API for guild check:", err);
        return true; // Don't lock users out on API/network failure
    }
}

async function isAdmin(discordId: string) {
    if (isEnvAdminDiscordId(discordId)) return true;

    const { data } = await supabase.from("team_members").select("is_admin").eq("discord_uid", discordId).maybeSingle();

    return !!data?.is_admin;
}

/**
 * Auto-upsert the Discord user into team_members if they don't exist yet.
 * New users start with is_approved = false so they're hidden from public roster.
 * Existing members are left untouched (no overwrite of their data).
 */
async function autoRegisterMember(user: DiscordUser, isEnvAdmin = false) {
    try {
        const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null;
        const name = user.global_name || user.username;

        const { data: existing } = await supabase.from("team_members").select("id, avatar_url").eq("discord_uid", user.id).maybeSingle();

        if (!existing) {
            await supabase.from("team_members").insert({
                discord_uid: user.id,
                discord_tag: user.username,
                name: name,
                avatar_url: avatarUrl,
                role: isEnvAdmin ? "Commander" : "Member",
                is_admin: isEnvAdmin,
                is_approved: isEnvAdmin, // Env admins are auto-approved; others wait for review
                joined_at: new Date().toISOString(),
            });
        } else {
            // Sync name, avatar_url, and tag upon user login if they already exist
            await supabase
                .from("team_members")
                .update({
                    name: name,
                    avatar_url: avatarUrl || existing.avatar_url,
                    discord_tag: user.username,
                    updated_at: new Date().toISOString(),
                })
                .eq("discord_uid", user.id);
        }
        revalidateTag("team-members", { expire: 0 });
    } catch (err) {
        // Non-fatal — log but don't block login
        console.warn("autoRegisterMember failed:", err);
    }
}

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const expectedState = request.cookies.get("kmhq_discord_oauth_state")?.value;
    const returnTo = sanitizeReturnTo(request.cookies.get("kmhq_discord_oauth_return_to")?.value);

    if (!code || !state || !expectedState || state !== expectedState) {
        console.error("OAuth state mismatch:", { code: !!code, state, expectedState });
        const response = redirectTo(request, returnTo, { error: "oauth_state" });
        clearAdminSessionCookie(response);
        return response;
    }

    try {
        const token = await exchangeCode(request, code);
        const user = await fetchDiscordUser(token.access_token);
        const envAdmin = isEnvAdminDiscordId(user.id);
        const adminRequired = requiresAdmin(returnTo);

        const [isMember, admin] = await Promise.all([
            envAdmin ? Promise.resolve(true) : isGuildMember(user.id),
            envAdmin ? Promise.resolve(true) : isAdmin(user.id),
        ]);

        if (!isMember || (adminRequired && !admin)) {
            const response = redirectTo(request, returnTo, { denied: "1" });
            clearAdminSessionCookie(response);
            response.cookies.delete("kmhq_discord_oauth_state");
            response.cookies.delete("kmhq_discord_oauth_return_to");
            return response;
        }

        // Auto-register member in DB (no-op if already exists)
        await autoRegisterMember(user, envAdmin);

        const response = redirectTo(request, returnTo);
        setAdminSessionCookie(user, response);
        response.cookies.delete("kmhq_discord_oauth_state");
        response.cookies.delete("kmhq_discord_oauth_return_to");
        return response;
    } catch (error) {
        console.error("Discord admin auth failed:", error);
        const response = redirectTo(request, returnTo, { error: "discord_auth" });
        clearAdminSessionCookie(response);
        response.cookies.delete("kmhq_discord_oauth_state");
        response.cookies.delete("kmhq_discord_oauth_return_to");
        return response;
    }
}
