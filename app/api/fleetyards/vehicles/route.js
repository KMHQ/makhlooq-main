import { NextResponse } from "next/server";
import { cacheLife, cacheTag } from "next/cache";

function getNextLink(linkHeader) {
    if (!linkHeader) return null;

    const links = linkHeader.split(",").map((part) => part.trim());
    const next = links.find((part) => /rel="?next"?/.test(part));
    if (!next) return null;

    const match = next.match(/<([^>]+)>/);
    return match?.[1] || null;
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const all = url.searchParams.get("all") === "1" || url.searchParams.get("all") === "true";
        const perPage = url.searchParams.get("perPage") || (all ? "50" : "30");
        const page = url.searchParams.get("page") || "1";

        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }
        const data = await fetchVehicles({ slug, all, perPage, page });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error?.message || "Unexpected fetch error" }, { status: 500 });
    }
}

async function fetchVehicles({ slug, all, perPage, page }) {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const headers = { Accept: "application/json" };

    const fetchModelFallback = async () => {
        const modelResponse = await fetch(`https://api.fleetyards.net/v1/models/${encodeURIComponent(slug)}`, {
            headers,
        });
        const modelData = await modelResponse.json().catch(() => ({}));

        if (!modelResponse.ok) {
            return null;
        }

        return {
            meta: modelData?.meta || null,
            items: [modelData],
            pagesFetched: 1,
            type: "model",
        };
    };

    const fetchPage = async (pageNumberOrUrl) => {
        const targetUrl = String(pageNumberOrUrl).startsWith("http")
            ? pageNumberOrUrl
            : `https://api.fleetyards.net/v1/public/fleets/${encodeURIComponent(slug)}/vehicles?perPage=${encodeURIComponent(perPage)}&page=${encodeURIComponent(pageNumberOrUrl)}`;
        const response = await fetch(targetUrl, {
            headers,
        });
        const pageData = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                data: null,
                nextUrl: null,
                modelFallback: true,
                errorMessage: pageData?.message || pageData?.error || `FleetYards API error (${response.status})`,
            };
        }

        return {
            data: pageData,
            nextUrl: getNextLink(response.headers.get("link")),
        };
    };

    if (!all) {
        const pageResult = await fetchPage(page);
        if (pageResult.modelFallback) {
            const modelData = await fetchModelFallback();
            if (modelData) return modelData;
            throw new Error(pageResult.errorMessage || "FleetYards fleet/model lookup failed");
        }

        return pageResult.data;
    }

    const collected = [];
    let currentPageOrUrl = page;
    let meta = null;
    let pagesFetched = 0;

    while (true) {
        const pageResult = await fetchPage(currentPageOrUrl);
        if (pageResult.modelFallback) {
            const modelData = await fetchModelFallback();
            if (modelData) return modelData;
            throw new Error(pageResult.errorMessage || "FleetYards fleet/model lookup failed");
        }

        const { data: pageData, nextUrl } = pageResult;
        meta = pageData?.meta || meta;

        const items = Array.isArray(pageData?.items) ? pageData.items : Array.isArray(pageData) ? pageData : [];
        collected.push(...items);
        pagesFetched += 1;

        const itemCount = items.length;
        const perPageCount = Number(perPage) || 20;
        if (nextUrl) {
            currentPageOrUrl = nextUrl;
        } else if (itemCount >= perPageCount) {
            currentPageOrUrl = String((Number(currentPageOrUrl) || pagesFetched) + 1);
        } else {
            break;
        }

        if (pagesFetched >= 100) break;
    }

    return { meta, items: collected, pagesFetched };
}
