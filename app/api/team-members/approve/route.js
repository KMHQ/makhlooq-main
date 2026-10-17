import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../../lib/adminAuth";
import { invalidateCache } from "../../../../lib/redis";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT /api/team-members/approve?id=<member_id>  — Admin approves a pending member
export async function PUT(request) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await supabase.from("team_members").update({ is_approved: true }).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Invalidate cache
    await invalidateCache("team-members:all");
    await invalidateCache("team-members:approved");
    if (data?.discord_uid) {
        await invalidateCache(`team-members:uid:${data.discord_uid}`);
    }
    if (data?.name) {
        await invalidateCache(`team-members:uid:${data.name}`);
    }

    return NextResponse.json(data);
}

// DELETE /api/team-members/approve?id=<member_id>  — Admin rejects (deletes) a pending applicant
export async function DELETE(request) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { data, error } = await supabase.from("team_members").delete().eq("id", id).select().maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Invalidate cache
    await invalidateCache("team-members:all");
    await invalidateCache("team-members:approved");
    if (data?.discord_uid) {
        await invalidateCache(`team-members:uid:${data.discord_uid}`);
    }
    if (data?.name) {
        await invalidateCache(`team-members:uid:${data.name}`);
    }

    return NextResponse.json({ success: true });
}
