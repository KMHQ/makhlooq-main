import { NextResponse } from "next/server";
import { cacheLife, cacheTag } from "next/cache";

async function getFleetInfo(slug) {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const response = await fetch(`https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || data?.error || `FleetYards API error (${response.status})`);
    }

    return data;
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }

        return NextResponse.json(await getFleetInfo(slug));
    } catch (error) {
        return NextResponse.json({ error: error?.message || "Unexpected fetch error" }, { status: 500 });
    }
}
