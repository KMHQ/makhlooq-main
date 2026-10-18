import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { fetchDiscordMembers } from "@/lib/discord";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/errors";
import type { Insert, TeamMember } from "@/types/db";

async function getMember(discordUid: string): Promise<TeamMember | null> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    let { data: member, error } = await supabase.from("team_members").select("*").eq("discord_uid", discordUid).maybeSingle();

    if (!member) {
        const fallback = await supabase.from("team_members").select("*").ilike("name", discordUid).maybeSingle();
        if (fallback.data) member = fallback.data;
    }

    if (error) throw error;
    return member || null;
}

async function getMembers(approvedOnly: boolean): Promise<TeamMember[]> {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    let query = supabase.from("team_members").select("*");
    if (approvedOnly) query = query.eq("is_approved", true);
    const { data: members, error } = await query.order("joined_at");

    if (error) throw error;
    return members || [];
}

export async function GET(request: NextRequest) {
    const discordUid = request.nextUrl.searchParams.get("discord_uid");

    if (discordUid) {
        try {
            const data = await getMember(discordUid);

            if (!data) {
                return NextResponse.json({ error: "Member not found" }, { status: 404 });
            }
            return NextResponse.json(data);
        } catch (error) {
            console.error(`Supabase error fetching member by discord_uid ${discordUid}:`, errorMessage(error));
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
    }

    const showAll = request.nextUrl.searchParams.get("all") === "1";

    // Only admins can request all members (including unapproved)
    if (showAll) {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        return NextResponse.json(await getMembers(!showAll));
    } catch (error) {
        console.error("Supabase error fetching members:", errorMessage(error));
        return NextResponse.json({ error: "Database connection failed. Please check your Supabase credentials." }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = (await request.json()) as Insert<"team_members">;
    body.name = body.discord_tag || "Unknown";

    // Use the member's Discord display name (and avatar) when they're in the guild
    if (body.discord_uid) {
        try {
            const dm = (await fetchDiscordMembers()).find((m) => m.user?.id === body.discord_uid);
            if (dm) {
                body.name = dm.nick || dm.user.global_name || dm.user.username;
                if (dm.user.avatar && !body.avatar_url) {
                    body.avatar_url = `https://cdn.discordapp.com/avatars/${body.discord_uid}/${dm.user.avatar}.png`;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Discord members for name lookup:", error);
        }
    }

    const { data, error } = await supabase.from("team_members").insert(body).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json(data, { status: 201 });
}
