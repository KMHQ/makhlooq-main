import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { errorMessage } from "@/lib/errors";
import { FLEETYARDS_API } from "@/lib/fleetyards";

// Proxy to look up a FleetYards fleet or ship model by slug for admin validation
export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "slug is required" }, { status: 400 });
        }

        const cleanSlug = slug.trim();

        const data = await lookupSlug(cleanSlug);

        if (data.error) {
            return NextResponse.json({ found: false, error: data.error }, { status: 200 });
        }
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
    }
}

async function lookupSlug(cleanSlug: string): Promise<{ found: boolean; error?: string; [key: string]: unknown }> {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const headers = { Accept: "application/json" };

    // 1. Check ship model first (most common for fleet asset entries)
    const modelRes = await fetch(`${FLEETYARDS_API}/models/${encodeURIComponent(cleanSlug)}`, {
        headers,
    });

    if (modelRes.ok) {
        const model = await modelRes.json();
        const modelSlug = model.slug || cleanSlug;
        return {
            found: true,
            type: "model",
            webUrl: `https://fleetyards.net/ships/${modelSlug}`,
            fleet: {
                slug: modelSlug,
                name: model.name,
                memberCount: 1,
            },
            model,
        };
    }

    // 2. Fallback to public fleet lookup
    const fleetUrl = `${FLEETYARDS_API}/public/fleets/${encodeURIComponent(cleanSlug)}`;
    const statsUrl = `${FLEETYARDS_API}/public/fleets/${encodeURIComponent(cleanSlug)}/stats/members`;
    const res = await fetch(fleetUrl, { headers });

    if (res.ok) {
        const resData = await res.json();
        const statsRes = await fetch(statsUrl, { headers });
        const memberStats = statsRes.ok ? await statsRes.json() : null;

        return {
            found: true,
            type: "fleet",
            webUrl: `https://fleetyards.net/fleets/${cleanSlug}`,
            fleet: {
                ...resData,
                memberCount: memberStats?.total,
            },
        };
    }

    if (res.status === 404 && modelRes.status === 404) {
        return { found: false };
    }

    return { found: false, error: `FleetYards ${res.status}/${modelRes.status}` };
}
