import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";
import type { Update } from "@/types/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
    const { id } = await params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Display names are only synced from Discord.
    const { name: _name, ...body } = (await request.json()) as Update<"team_members">;

    const { data, error } = await supabase.from("team_members").update(body).eq("id", Number(id)).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Context) {
    const { id } = await params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { error } = await supabase.from("team_members").delete().eq("id", Number(id));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json({ success: true });
}
