import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../../lib/adminAuth";
import { revalidateTag } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(request, props) {
    const params = await props.params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();

    // Enforce that display names are only synced via Discord
    delete body.name;

    const { data, error } = await supabase.from("team_members").update(body).eq("id", params.id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json(data);
}

export async function DELETE(_request, props) {
    const params = await props.params;
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await supabase.from("team_members").delete().eq("id", params.id).select().maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidateTag("team-members", { expire: 0 });

    return NextResponse.json({ success: true });
}
