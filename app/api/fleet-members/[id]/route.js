import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../../lib/adminAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT — update member name/role (admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const { name, role } = await request.json();

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (role !== undefined) updateData.role = role.trim() || "Member";

        const { data, error } = await supabase.from("fleet_members").update(updateData).eq("id", id).select().single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — remove member (admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const { error } = await supabase.from("fleet_members").delete().eq("id", id);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
