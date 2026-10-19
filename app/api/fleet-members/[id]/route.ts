import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { supabase } from "@/app/lib/supabase";
import { errorMessage } from "@/app/lib/errors";
import type { Update } from "@/types/db";

type Context = { params: Promise<{ id: string }> };

// PUT — update member name/role (admin only)
export async function PUT(request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const { name, role } = (await request.json()) as { name?: string; role?: string };

        const updateData: Update<"fleet_members"> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (role !== undefined) updateData.role = role.trim() || "Member";

        const { data, error } = await supabase.from("fleet_members").update(updateData).eq("id", id).select().single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

// DELETE — remove member (admin only)
export async function DELETE(_request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const { error } = await supabase.from("fleet_members").delete().eq("id", id);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
