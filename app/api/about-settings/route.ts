import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../lib/adminAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
    const { data, error } = await supabase.from("about_settings").select("*").limit(1).single();

    if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {});
}

export async function POST(request) {
    const auth = await requireFleetAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const contentType = request.headers.get("content-type") || "";
    let bridgeHeading;
    let bridgeSubtitle;
    let bridgeBackgroundUrl;
    let archivesBackgroundUrl;
    let archivesIntroYear;
    let archivesIntroTitle;
    let archivesIntroDesc;
    let bridgeBackgroundFile;
    let archivesBackgroundFile;

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        bridgeHeading = String(formData.get("bridge_heading") || "").trim() || null;
        bridgeSubtitle = String(formData.get("bridge_subtitle") || "").trim() || null;
        bridgeBackgroundUrl = String(formData.get("bridge_background_url") || "").trim() || null;
        archivesBackgroundUrl = String(formData.get("archives_background_url") || "").trim() || null;
        archivesIntroYear = String(formData.get("archives_intro_year") || "").trim() || null;
        archivesIntroTitle = String(formData.get("archives_intro_title") || "").trim() || null;
        archivesIntroDesc = String(formData.get("archives_intro_desc") || "").trim() || null;
        bridgeBackgroundFile = formData.get("bridge_background_file");
        archivesBackgroundFile = formData.get("archives_background_file");
    } else {
        const body = await request.json();
        bridgeHeading = String(body.bridge_heading || "").trim() || null;
        bridgeSubtitle = String(body.bridge_subtitle || "").trim() || null;
        bridgeBackgroundUrl = String(body.bridge_background_url || "").trim() || null;
        archivesBackgroundUrl = String(body.archives_background_url || "").trim() || null;
        archivesIntroYear = String(body.archives_intro_year || "").trim() || null;
        archivesIntroTitle = String(body.archives_intro_title || "").trim() || null;
        archivesIntroDesc = String(body.archives_intro_desc || "").trim() || null;
    }

    let storedBridgeBackgroundUrl = bridgeBackgroundUrl;
    let storedArchivesBackgroundUrl = archivesBackgroundUrl;

    // Handle bridge background file upload
    if (bridgeBackgroundFile && typeof bridgeBackgroundFile !== "string" && typeof bridgeBackgroundFile.arrayBuffer === "function") {
        const ext =
            String(bridgeBackgroundFile.name || "")
                .split(".")
                .pop() || "png";
        const fileName = `bridge-bg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `about-settings/${fileName}`;
        const bytes = Buffer.from(await bridgeBackgroundFile.arrayBuffer());

        const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(path, bytes, { contentType: bridgeBackgroundFile.type || "image/png", upsert: true });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
        storedBridgeBackgroundUrl = publicData?.publicUrl || null;
    }

    // Handle archives background file upload
    if (archivesBackgroundFile && typeof archivesBackgroundFile !== "string" && typeof archivesBackgroundFile.arrayBuffer === "function") {
        const ext =
            String(archivesBackgroundFile.name || "")
                .split(".")
                .pop() || "png";
        const fileName = `archives-bg-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `about-settings/${fileName}`;
        const bytes = Buffer.from(await archivesBackgroundFile.arrayBuffer());

        const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(path, bytes, { contentType: archivesBackgroundFile.type || "image/png", upsert: true });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
        storedArchivesBackgroundUrl = publicData?.publicUrl || null;
    }

    const draft = {
        id: "main",
        bridge_heading: bridgeHeading,
        bridge_subtitle: bridgeSubtitle,
        bridge_background_url: storedBridgeBackgroundUrl,
        archives_background_url: storedArchivesBackgroundUrl,
        archives_intro_year: archivesIntroYear,
        archives_intro_title: archivesIntroTitle,
        archives_intro_desc: archivesIntroDesc,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("about_settings").upsert(draft, { onConflict: "id" }).select().single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}
