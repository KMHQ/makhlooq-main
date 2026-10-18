import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";

async function getAuthorizedId(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return { response: NextResponse.json({ error: auth.error }, { status: auth.status }) };

    const id = request.nextUrl.searchParams.get("id");
    if (!id) return { response: NextResponse.json({ error: "id is required" }, { status: 400 }) };

    return { id: Number(id) };
}

// PUT /api/team-members/approve?id=<member_id>  — Admin approves a pending member
export async function PUT(request: NextRequest) {
    const { id, response } = await getAuthorizedId(request);
    if (response) return response;

    const { data, error } = await supabase.from("team_members").update({ is_approved: true }).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json(data);
}

// DELETE /api/team-members/approve?id=<member_id>  — Admin rejects (deletes) a pending applicant
export async function DELETE(request: NextRequest) {
    const { id, response } = await getAuthorizedId(request);
    if (response) return response;

    const { error } = await supabase.from("team_members").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json({ success: true });
}
