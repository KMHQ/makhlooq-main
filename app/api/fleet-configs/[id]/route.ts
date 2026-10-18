import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/errors";
import { toFleetType } from "@/lib/fleetTypes";
import type { Update } from "@/types/db";

type Context = { params: Promise<{ id: string }> };

const EDITABLE_FIELDS = ["slug", "display_name", "sort_order", "enabled", "ceo_name", "ceo_discord_uid", "quantity"] as const;

// PUT — update a fleet config
export async function PUT(request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const updates = (await request.json()) as Update<"fleet_configs">;

        const updateData: Update<"fleet_configs"> = {};
        for (const field of EDITABLE_FIELDS) {
            if (updates[field] !== undefined) Object.assign(updateData, { [field]: updates[field] });
        }
        if (updates.fleet_type !== undefined) updateData.fleet_type = toFleetType(updates.fleet_type);

        const { data, error } = await supabase.from("fleet_configs").update(updateData).eq("id", Number(id)).select().single();
        if (error) throw error;

        revalidateTag("fleet-configs", { expire: 0 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

// DELETE — remove a fleet config
export async function DELETE(_request: NextRequest, { params }: Context) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { id } = await params;
        const { error } = await supabase.from("fleet_configs").delete().eq("id", Number(id));
        if (error) throw error;

        revalidateTag("fleet-configs", { expire: 0 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
