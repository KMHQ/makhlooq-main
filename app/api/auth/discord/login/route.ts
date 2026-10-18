import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";

function getBaseUrl(request: NextRequest) {
    return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

const oauthCookie = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
} as const;

export async function GET(request: NextRequest) {
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "DISCORD_CLIENT_ID is required" }, { status: 500 });
    }

    const rawReturnTo = request.nextUrl.searchParams.get("returnTo") || "/fleet/admin";
    const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/fleet/admin";
    const state = randomUUID();

    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", `${getBaseUrl(request)}/api/auth/discord/callback`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", state);

    const response = NextResponse.redirect(url);
    response.cookies.set({ ...oauthCookie, name: "kmhq_discord_oauth_state", value: state });
    response.cookies.set({ ...oauthCookie, name: "kmhq_discord_oauth_return_to", value: returnTo });
    return response;
}
