import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { supabase } from "@/app/lib/supabase";
import { errorMessage } from "@/app/lib/errors";

// GET — list members for a fleet (public, no auth needed)
export async function GET(request: NextRequest) {
    const fleetId = request.nextUrl.searchParams.get("fleetId");

    try {
        let query = supabase.from("fleet_members").select("*").order("created_at", { ascending: true });
        if (fleetId) query = query.eq("fleet_config_id", Number(fleetId));

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error("fleet_members GET failed:", error);
        return NextResponse.json([]); // graceful fallback
    }
}

// POST — add a member (admin only)
export async function POST(request: NextRequest) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { fleet_config_id, name, role } = (await request.json()) as { fleet_config_id?: number; name?: string; role?: string };

        if (!fleet_config_id || !name?.trim()) {
            return NextResponse.json({ error: "fleet_config_id and name are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("fleet_members")
            .insert({ fleet_config_id, name: name.trim(), role: role?.trim() || "Member" })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("fleet_members POST failed:", error);
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
