import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession, getAdminFromDiscordId } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const adminParam = request.nextUrl.searchParams.get("admin");
    const requireAdmin = adminParam === "1" || adminParam === "true";
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
