import { NextResponse } from "next/server";
import { getAdminSession, getAdminFromDiscordId } from "../../../../../lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
    const url = new URL(request.url);
    const requireAdmin = url.searchParams.get("admin") === "1" || url.searchParams.get("admin") === "true";
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ authenticated: false, admin: false }, { status: 401 });

    const admin = await getAdminFromDiscordId(session.discordId);
    if (requireAdmin && !admin) return NextResponse.json({ authenticated: true, admin: false }, { status: 403 });

    const { data: member } = await supabase.from("team_members").select("*").eq("discord_uid", session.discordId).maybeSingle();

    return NextResponse.json({
        authenticated: true,
        admin: !!admin,
        user: {
            discordId: session.discordId,
            username: session.username,
            name: admin?.name || member?.name || session.username,
            avatarUrl: admin?.avatar_url || member?.avatar_url || null,
            source: admin?.source || (member ? "team_members" : "discord"),
        },
        member: member || null,
    });
}
