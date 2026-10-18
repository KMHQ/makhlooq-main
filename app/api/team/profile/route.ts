import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getAdminSession } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";
import type { Update } from "@/types/db";

const EDITABLE_FIELDS = ["node_color", "flair_color", "bio", "status", "avatar_url"] as const;
const MAX_AVATAR_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "gif"];

async function updateOwnMember(discordId: string, changes: Update<"team_members">) {
    const { data, error } = await supabase.from("team_members").update(changes).eq("discord_uid", discordId).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });
    return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
    const session = await getAdminSession();
    if (!session?.discordId) {
        return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as Update<"team_members">;
    const changes: Update<"team_members"> = {};
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

    const path = `avatars/${session.discordId}.${ext}`;
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { publicUrl } = supabase.storage.from("avatars").getPublicUrl(path).data;
    return updateOwnMember(session.discordId, { avatar_url: publicUrl });
}
