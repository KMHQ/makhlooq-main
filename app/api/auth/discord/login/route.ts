import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

function getBaseUrl(request) {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    let url = new URL(request.url).origin;
    if (url.endsWith("/")) url = url.slice(0, -1);
    return url;
}

export async function GET(request) {
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "DISCORD_CLIENT_ID is required" }, { status: 500 });
    }

    const requestUrl = new URL(request.url);
    const rawReturnTo = requestUrl.searchParams.get("returnTo") || "/fleet/admin";
    const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/fleet/admin";
    const origin = getBaseUrl(request);
    const redirectUri = `${origin}/api/auth/discord/callback`;
    const state = randomUUID();

    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", state);

    const response = NextResponse.redirect(url);
    response.cookies.set({
        name: "kmhq_discord_oauth_state",
        value: state,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
    });
    response.cookies.set({
        name: "kmhq_discord_oauth_return_to",
        value: returnTo,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
    });

    return response;
}
