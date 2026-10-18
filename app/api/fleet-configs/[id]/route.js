import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../../lib/adminAuth";
import { revalidateTag } from "next/cache";

// Use service role key for admin operations to bypass RLS, fallback to anon key for local dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT — update a fleet config
export async function PUT(request, { params }) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const updates = await request.json();

        const allowedFields = ["slug", "display_name", "sort_order", "enabled", "fleet_type", "ceo_name", "ceo_discord_uid", "quantity"];
        const validFleetTypes = ["small", "medium", "large", "sub_capital", "capital"];
        const updateData = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                if (field === "fleet_type") {
                    // Validate and sanitize fleet_type to prevent enum errors
                    updateData[field] = validFleetTypes.includes(updates[field]) ? updates[field] : "small";
                } else {
                    updateData[field] = updates[field];
                }
            }
        }

        const { data, error } = await supabase.from("fleet_configs").update(updateData).eq("id", id).select().single();

        if (error) throw error;

        revalidateTag("fleet-configs", { expire: 0 });

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — remove a fleet config
export async function DELETE(request, { params }) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const { error } = await supabase.from("fleet_configs").delete().eq("id", id);

        if (error) throw error;

        revalidateTag("fleet-configs", { expire: 0 });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
