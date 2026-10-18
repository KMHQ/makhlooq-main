import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }

        const baseUrl = `https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}/stats`;
        const options = {
            headers: { Accept: "application/json" },
            next: { revalidate: 300 },
        };

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

        return NextResponse.json({ members, vehicles });
    } catch (error) {
        return NextResponse.json({ error: error?.message || "Unexpected FleetYards fetch error" }, { status: 500 });
    }
}
