import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin, getAdminSession } from "../../../lib/adminAuth";
import { fetchDiscordMembers } from "../../../lib/discord";
import { unstable_cache, revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
    const url = new URL(request.url);
    const discordUid = url.searchParams.get("discord_uid");

    if (discordUid) {
        try {
            const data = await unstable_cache(
                async () => {
                    let { data: member, error } = await supabase
                        .from("team_members")
                        .select("*")
                        .eq("discord_uid", discordUid)
                        .maybeSingle();

                    if (!member) {
                        const fallback = await supabase.from("team_members").select("*").ilike("name", discordUid).maybeSingle();
                        if (fallback.data) member = fallback.data;
                    }

                    if (error) {
                        throw error;
                    }
                    return member || null;
                },
                [`team-members:uid:${discordUid}`],
                { tags: ["team-members"], revalidate: 3600 },
            )();

            if (!data) {
                return NextResponse.json({ error: "Member not found" }, { status: 404 });
            }
            return NextResponse.json(data);
        } catch (error) {
            console.error(`Supabase error fetching member by discord_uid ${discordUid}:`, error.message);
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
    }

    const showAll = url.searchParams.get("all") === "1";

    // Only admins can request all members (including unapproved)
    if (showAll) {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        try {
            const data = await unstable_cache(
                async () => {
                    const { data: members, error } = await supabase.from("team_members").select("*").order("joined_at");

                    if (error) throw error;
                    return members || [];
                },
                ["team-members:all"],
                { tags: ["team-members"], revalidate: 3600 },
            )();

            return NextResponse.json(data);
        } catch (error) {
            console.error("Supabase error fetching all members:", error.message);
            return NextResponse.json({ error: "Database connection failed. Please check your Supabase credentials." }, { status: 500 });
        }
    }

    // Public: only return approved members
    try {
        const data = await unstable_cache(
            async () => {
                const { data: members, error } = await supabase.from("team_members").select("*").eq("is_approved", true).order("joined_at");

                if (error) throw error;
                return members || [];
            },
            ["team-members:approved"],
            { tags: ["team-members"], revalidate: 3600 },
        )();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Supabase error fetching approved members:", error.message);
        return NextResponse.json({ error: "Database connection failed. Please check your Supabase credentials." }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();

    // Automatically fetch Discord name for the member using their discord_uid
    if (body.discord_uid) {
        try {
            const discordMembers = await fetchDiscordMembers();
            const dm = discordMembers.find((m) => m.user?.id === body.discord_uid);
            if (dm) {
                body.name = dm.nick || dm.user.global_name || dm.user.username;
                if (dm.user.avatar && !body.avatar_url) {
                    body.avatar_url = `https://cdn.discordapp.com/avatars/${body.discord_uid}/${dm.user.avatar}.png`;
                }
            } else {
                body.name = body.discord_tag || "Unknown";
            }
        } catch (err) {
            console.error("Failed to fetch Discord members for name lookup:", err);
            body.name = body.discord_tag || "Unknown";
        }
    } else {
        body.name = body.discord_tag || "Unknown";
    }

    const { data, error } = await supabase.from("team_members").insert(body).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json(data, { status: 201 });
}
