import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { errorMessage } from "@/app/lib/errors";
import { FLEETYARDS_API } from "@/app/lib/fleetyards";

async function getFleetStats(slug: string) {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const baseUrl = `${FLEETYARDS_API}/public/fleets/${encodeURIComponent(slug)}/stats`;
    const options = { headers: { Accept: "application/json" } };

    const [membersResponse, vehiclesResponse] = await Promise.all([
        fetch(`${baseUrl}/members`, options),
        fetch(`${baseUrl}/vehicles`, options),
    ]);

    if (!membersResponse.ok || !vehiclesResponse.ok) {
        const failedResponse = !membersResponse.ok ? membersResponse : vehiclesResponse;
        const resData = await failedResponse.json().catch(() => ({}));

        throw new Error(resData?.message || resData?.error || `FleetYards API error (${failedResponse.status})`);
    }

    const [members, vehicles] = await Promise.all([membersResponse.json(), vehiclesResponse.json()]);
    return { members, vehicles };
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    try {
        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }

        return NextResponse.json(await getFleetStats(slug));
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error, "Unexpected FleetYards fetch error") }, { status: 500 });
    }
}
