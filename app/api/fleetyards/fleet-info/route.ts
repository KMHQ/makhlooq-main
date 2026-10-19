import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { errorMessage } from "@/app/lib/errors";
import { FLEETYARDS_API } from "@/app/lib/fleetyards";

async function getFleetInfo(slug: string) {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const response = await fetch(`${FLEETYARDS_API}/public/fleets/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || data?.error || `FleetYards API error (${response.status})`);
    }

    return data;
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    try {
        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }

        return NextResponse.json(await getFleetInfo(slug));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error, "Unexpected fetch error") }, { status: 500 });
    }
}
