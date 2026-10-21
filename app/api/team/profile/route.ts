import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/app/lib/adminAuth";
import { getPayloadInstance } from "@/app/lib/payload";
import { errorMessage } from "@/app/lib/errors";
import type { TeamMember } from "@/payload-types";

const EDITABLE_FIELDS = ["node_color", "flair_color", "bio", "status", "avatar_url"] as const;
const MAX_AVATAR_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];

async function updateOwnMember(discordId: string, changes: Partial<TeamMember>) {
    try {
        const payload = await getPayloadInstance();
        const { docs, errors } = await payload.update({
            collection: "team_members",
            where: { discord_uid: { equals: discordId } },
            data: changes,
        });
        if (errors.length) return NextResponse.json({ error: errors[0].message }, { status: 500 });
        if (!docs[0]) return NextResponse.json({ error: "Member not found" }, { status: 404 });
        return NextResponse.json(docs[0]);
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getAdminSession();
    if (!session?.discordId) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<TeamMember>;
    const changes: Partial<TeamMember> = {};
    for (const key of EDITABLE_FIELDS) {
        if (body[key] !== undefined) Object.assign(changes, { [key]: body[key] });
    }

    return updateOwnMember(session.discordId, changes);
}

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session?.discordId) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const file = (await request.formData()).get("avatar");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "avatar file is required" }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_BYTES) {
        return NextResponse.json({ error: "File size exceeds the 20MB limit." }, { status: 400 });
    }

    const ext = (file.name || "png").split(".").pop()?.toLowerCase() || "png";
    if (!ALLOWED_MIMES.includes(file.type) || !ALLOWED_EXTS.includes(ext)) {
        return NextResponse.json({ error: "Only JPG, PNG, WEBP, and GIF images are allowed." }, { status: 400 });
    }

    try {
        const payload = await getPayloadInstance();
        const avatar = await payload.create({
            collection: "avatars",
            data: { discord_uid: session.discordId },
            file: {
                data: Buffer.from(await file.arrayBuffer()),
                mimetype: file.type,
                name: `${session.discordId}.${ext}`,
                size: file.size,
            },
        });

        // Keep only the latest upload per member.
        await payload.delete({
            collection: "avatars",
            where: { and: [{ discord_uid: { equals: session.discordId } }, { id: { not_equals: avatar.id } }] },
        });

        return updateOwnMember(session.discordId, { avatar_url: avatar.url });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
