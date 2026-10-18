import { NextResponse, type NextRequest } from "next/server";
import { requireFleetAdmin } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";

const TEXT_FIELDS = [
    "bridge_heading",
    "bridge_subtitle",
    "bridge_background_url",
    "archives_background_url",
    "archives_intro_year",
    "archives_intro_title",
    "archives_intro_desc",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];

export async function GET() {
    const { data, error } = await supabase.from("about_settings").select("*").limit(1).single();

    // PGRST116: no row yet
    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {});
}

// Uploads a background image to the `media` bucket and returns its public URL.
async function uploadBackground(file: File, prefix: string) {
    const ext = file.name.split(".").pop() || "png";
    const path = `about-settings/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
        .from("media")
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || "image/png", upsert: true });
    if (error) throw error;

    return supabase.storage.from("media").getPublicUrl(path).data.publicUrl || null;
}

export async function POST(request: NextRequest) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const isMultipart = (request.headers.get("content-type") || "").includes("multipart/form-data");
    const formData = isMultipart ? await request.formData() : null;
    const body = isMultipart ? null : ((await request.json()) as Partial<Record<TextField, unknown>>);

    const values = {} as Record<TextField, string | null>;
    for (const field of TEXT_FIELDS) {
        const raw = formData ? formData.get(field) : body?.[field];
        values[field] = String(raw || "").trim() || null;
    }

    try {
        const bridgeFile = formData?.get("bridge_background_file");
        if (bridgeFile instanceof File) values.bridge_background_url = await uploadBackground(bridgeFile, "bridge-bg");

        const archivesFile = formData?.get("archives_background_file");
        if (archivesFile instanceof File) values.archives_background_url = await uploadBackground(archivesFile, "archives-bg");
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }

    const { data, error } = await supabase
        .from("about_settings")
        .upsert({ id: "main", ...values, updated_at: new Date().toISOString() }, { onConflict: "id" })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
