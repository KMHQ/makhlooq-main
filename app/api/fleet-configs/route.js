import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireFleetAdmin } from "../../../lib/adminAuth";
import { unstable_cache, revalidateTag } from "next/cache";

// Use service role key for admin operations to bypass RLS, fallback to anon key for local dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

function getEnvFleetConfigs() {
    const raw = process.env.FLEETYARDS_FLEET_SLUGS || process.env.NEXT_PUBLIC_FLEETYARDS_FLEET_SLUGS || "";
    return raw
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean)
        .map((slug, index) => ({
            id: `env-${slug}`,
            slug,
            display_name: slug,
            enabled: true,
            sort_order: index,
            source: "env",
        }));
}

// GET — list all fleet configs (ordered by sort_order)
export async function GET(request) {
    try {
        const envConfigs = getEnvFleetConfigs();
        const enrichedData = await unstable_cache(
            async () => {
                const { data, error } = await supabase
                    .from("fleet_configs")
                    .select("*")
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    // Fetch team members to map avatars by discord_uid, id, and name
                    const { data: members } = await supabase.from("team_members").select("id, discord_uid, name, avatar_url");

                    const avatarsMap = {};
                    if (members && members.length > 0) {
                        members.forEach((m) => {
                            if (!m.avatar_url) return;
                            if (m.discord_uid) avatarsMap[m.discord_uid] = m.avatar_url;
                            if (m.id) avatarsMap[m.id] = m.avatar_url;
                            if (m.name) avatarsMap[m.name.trim().toLowerCase()] = m.avatar_url;
                        });
                    }

                    return data.map((d) => {
                        const avatar =
                            (d.ceo_discord_uid && avatarsMap[d.ceo_discord_uid]) ||
                            (d.ceo_name && avatarsMap[d.ceo_name.trim().toLowerCase()]) ||
                            null;
                        return {
                            ...d,
                            ceo_avatar_url: avatar,
                        };
                    });
                }
                return [];
            },
            ["fleet-configs:all"],
            { tags: ["fleet-configs"], revalidate: 3600 },
        )();

        if (enrichedData && enrichedData.length > 0) {
            // Combine env configs with DB configs; since slugs are no longer unique,
            // we show all DB configs as-is, and prepend any env slugs not yet in DB.
            const dbSlugs = new Set(enrichedData.map((d) => d.slug));
            const filteredEnv = envConfigs.filter((env) => !dbSlugs.has(env.slug));
            return NextResponse.json([...filteredEnv, ...enrichedData]);
        }
        return NextResponse.json(envConfigs);
    } catch (err) {
        if (err?.code !== "PGRST205") {
            console.error("fleet_configs lookup failed:", err);
        }
        return NextResponse.json(getEnvFleetConfigs());
    }
}

// POST — create new fleet config
// Note: slug is NOT unique — multiple ships of the same type (e.g. two Polaris) are allowed.
export async function POST(request) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { slug, display_name, sort_order, enabled, fleet_type, ceo_name, ceo_discord_uid, quantity } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: "slug is required" }, { status: 400 });
        }

        // Validate fleet_type against allowed values
        const validFleetTypes = ["small", "medium", "large", "sub_capital", "capital"];
        const safeFleetType = validFleetTypes.includes(fleet_type) ? fleet_type : "small";

        const { data, error } = await supabase
            .from("fleet_configs")
            .insert([
                {
                    slug: slug.trim(),
                    display_name: display_name?.trim() || slug.trim(),
                    sort_order: sort_order || 0,
                    enabled: enabled ?? true,
                    fleet_type: safeFleetType,
                    ceo_name: ceo_name?.trim() || null,
                    ceo_discord_uid: ceo_discord_uid?.trim() || null,
                    quantity: Math.max(1, parseInt(quantity) || 1),
                },
            ])
            .select()
            .single();

        if (error) throw error;
        revalidateTag("fleet-configs", { expire: 0 });

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("fleet_configs insert failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
