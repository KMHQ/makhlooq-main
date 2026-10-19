import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { requireFleetAdmin } from "@/app/lib/adminAuth";
import { supabase } from "@/app/lib/supabase";
import { errorMessage } from "@/app/lib/errors";
import { toFleetType } from "@/app/lib/fleetTypes";
import type { FleetConfig } from "@/types/db";

// Fleets listed in FLEETYARDS_FLEET_SLUGS show up even before they have a DB row.
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

async function getFleetConfigs(): Promise<(FleetConfig & { ceo_avatar_url: string | null })[]> {
    "use cache";
    cacheLife("hours");
    cacheTag("fleet-configs", "team-members");

    const { data, error } = await supabase
        .from("fleet_configs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data?.length) return [];

    // Map CEO avatars by discord_uid or lowercased name
    const { data: members } = await supabase.from("team_members").select("discord_uid, name, avatar_url");

    const avatars = new Map<string, string>();
    for (const m of members ?? []) {
        if (!m.avatar_url) continue;
        if (m.discord_uid) avatars.set(m.discord_uid, m.avatar_url);
        if (m.name) avatars.set(m.name.trim().toLowerCase(), m.avatar_url);
    }

    return data.map((d) => ({
        ...d,
        ceo_avatar_url:
            (d.ceo_discord_uid && avatars.get(d.ceo_discord_uid)) || (d.ceo_name && avatars.get(d.ceo_name.trim().toLowerCase())) || null,
    }));
}

// GET — list all fleet configs (ordered by sort_order)
export async function GET() {
    const envConfigs = getEnvFleetConfigs();

    try {
        const dbConfigs = await getFleetConfigs();

        // Slugs aren't unique, so show every DB config and prepend env slugs not yet in the DB.
        const dbSlugs = new Set(dbConfigs.map((d) => d.slug));
        return NextResponse.json([...envConfigs.filter((env) => !dbSlugs.has(env.slug)), ...dbConfigs]);
    } catch (error) {
        // PGRST205: table missing (fresh database); fall back to env configs quietly
        if ((error as { code?: string })?.code !== "PGRST205") {
            console.error("fleet_configs lookup failed:", error);
        }
        return NextResponse.json(envConfigs);
    }
}

interface FleetConfigInput {
    slug?: string;
    display_name?: string;
    sort_order?: number;
    enabled?: boolean;
    fleet_type?: string;
    ceo_name?: string;
    ceo_discord_uid?: string;
    quantity?: number | string;
}

// POST — create new fleet config
// Note: slug is NOT unique — multiple ships of the same type (e.g. two Polaris) are allowed.
export async function POST(request: NextRequest) {
    try {
        const auth = await requireFleetAdmin();
        if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { slug, display_name, sort_order, enabled, fleet_type, ceo_name, ceo_discord_uid, quantity } =
            (await request.json()) as FleetConfigInput;

        if (!slug) {
            return NextResponse.json({ error: "slug is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("fleet_configs")
            .insert({
                slug: slug.trim(),
                display_name: display_name?.trim() || slug.trim(),
                sort_order: sort_order || 0,
                enabled: enabled ?? true,
                fleet_type: toFleetType(fleet_type),
                ceo_name: ceo_name?.trim() || null,
                ceo_discord_uid: ceo_discord_uid?.trim() || null,
                quantity: Math.max(1, parseInt(String(quantity)) || 1),
            })
            .select()
            .single();

        if (error) throw error;
        revalidateTag("fleet-configs", { expire: 0 });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("fleet_configs insert failed:", error);
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
