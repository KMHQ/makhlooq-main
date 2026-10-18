import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../lib/adminAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET — list members for a fleet (public, no auth needed)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get("fleetId");

    try {
        let query = supabase.from("fleet_members").select("*").order("created_at", { ascending: true });

        if (fleetId) {
            query = query.eq("fleet_config_id", fleetId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err) {
        console.error("fleet_members GET failed:", err);
        return NextResponse.json([], { status: 200 }); // graceful fallback
    }
}

// POST — add a member (admin only)
export async function POST(request) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { fleet_config_id, name, role } = await request.json();

        if (!fleet_config_id || !name?.trim()) {
            return NextResponse.json({ error: "fleet_config_id and name are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("fleet_members")
            .insert([
                {
                    fleet_config_id,
                    name: name.trim(),
                    role: role?.trim() || "Member",
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("fleet_members POST failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
