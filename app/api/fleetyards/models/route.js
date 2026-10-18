import { NextResponse } from "next/server";

const API_BASE = "https://api.fleetyards.net/v1";

function getNextLink(linkHeader) {
    if (!linkHeader) return null;

    const links = linkHeader.split(",").map((part) => part.trim());
    const next = links.find((part) => /rel="?next"?/.test(part));
    if (!next) return null;

    const match = next.match(/<([^>]+)>/);
    return match?.[1] || null;
}

async function readJson(response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const all = url.searchParams.get("all") === "1" || url.searchParams.get("all") === "true";
        const fresh = url.searchParams.get("fresh") === "1" || url.searchParams.get("fresh") === "true";
        const perPage = url.searchParams.get("perPage") || (all ? "50" : "30");
        const page = url.searchParams.get("page") || "1";
        const slugs = (url.searchParams.get("slugs") || "")
            .split(",")
            .map((slug) => slug.trim())
            .filter(Boolean);

        if (slugs.length === 0) {
            if (!all) {
                return NextResponse.json({ error: "Missing slugs parameter" }, { status: 400 });
            }

            const fetchAllModels = async () => {
                const collected = [];
                let currentPageOrUrl = page;
                let pagesFetched = 0;

                while (true) {
                    const targetUrl = String(currentPageOrUrl).startsWith("http")
                        ? currentPageOrUrl
                        : `${API_BASE}/models?perPage=${encodeURIComponent(perPage)}&page=${encodeURIComponent(currentPageOrUrl)}`;
                    const response = await fetch(targetUrl, {
                        headers: { Accept: "application/json" },
                        ...(fresh ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
                    });
                    const data = await readJson(response);

                    if (!response.ok) {
                        throw new Error(data?.message || data?.error || `FleetYards API error (${response.status})`);
                    }

                    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
                    collected.push(...items);
                    pagesFetched += 1;

                    const nextUrl = getNextLink(response.headers.get("link"));
                    if (nextUrl) {
                        currentPageOrUrl = nextUrl;
                    } else if (items.length >= (Number(perPage) || 30)) {
                        currentPageOrUrl = String((Number(currentPageOrUrl) || pagesFetched) + 1);
                    } else {
                        break;
                    }

                    if (pagesFetched >= 100) break;
                }

                return { items: collected, pagesFetched };
            };

            return NextResponse.json(await fetchAllModels());
        }

        const models = await Promise.all(
            slugs.map(async (slug) => {
                const response = await fetch(`${API_BASE}/models/${encodeURIComponent(slug)}`, {
                    headers: { Accept: "application/json" },
                    ...(fresh ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
                });
                const data = await readJson(response);

                if (!response.ok) {
                    return {
                        slug,
                        error: data?.message || data?.error || `FleetYards API error (${response.status})`,
                    };
                }

                return data;
            }),
        );

        return NextResponse.json({ items: models });
    } catch (error) {
        return NextResponse.json({ error: error?.message || "Unexpected FleetYards model fetch error" }, { status: 500 });
    }
}
