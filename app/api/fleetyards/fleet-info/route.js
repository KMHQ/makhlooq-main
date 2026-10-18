import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }

        const targetUrl = `https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}`;
        const response = await fetch(targetUrl, {
            headers: { Accept: "application/json" },
            next: { revalidate: 300 },
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || data?.error || `FleetYards API error (${response.status})`);
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error?.message || "Unexpected fetch error" }, { status: 500 });
    }
}
