import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { fetchDiscordMembers } from "@/app/lib/discord";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import { getMember, getMembers } from "@/app/lib/teamMembers";
import type { TeamMember } from "@/payload-types";

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
            console.error(`Error fetching member by discord_uid ${discordUid}:`, errorMessage(error));
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
        console.error("Error fetching members:", errorMessage(error));
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = (await request.json()) as Partial<TeamMember>;
    if (!body.discord_uid) return NextResponse.json({ error: "discord_uid is required" }, { status: 400 });
    body.name = body.discord_tag || "Unknown";

    // Use the member's Discord display name (and avatar) when they're in the guild
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

    try {
        const payload = await getPayloadInstance();
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = body;
        const member = await payload.create({
            collection: "team_members",
            data: { ...data, discord_uid: body.discord_uid, name: body.name },
        });
        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
