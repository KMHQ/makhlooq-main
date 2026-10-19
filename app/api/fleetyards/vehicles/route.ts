import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { errorMessage } from "@/app/lib/errors";
import { FLEETYARDS_API, getNextLink } from "@/app/lib/fleetyards";

export async function GET(request: NextRequest) {
    const url = request.nextUrl;
    const slug = url.searchParams.get("slug");
    const all = url.searchParams.get("all") === "1" || url.searchParams.get("all") === "true";
    const perPage = url.searchParams.get("perPage") || (all ? "50" : "30");
    const page = url.searchParams.get("page") || "1";

    try {
        if (!slug) {
            return NextResponse.json({ error: "Missing fleet slug parameter" }, { status: 400 });
        }
        const data = await fetchVehicles({ slug, all, perPage, page });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error, "Unexpected fetch error") }, { status: 500 });
    }
}

interface VehiclesQuery {
    slug: string;
    all: boolean;
    perPage: string;
    page: string;
}

async function fetchVehicles({ slug, all, perPage, page }: VehiclesQuery) {
    "use cache";
    cacheLife({ revalidate: 300 });
    cacheTag("fleetyards");

    const headers = { Accept: "application/json" };

    const fetchModelFallback = async () => {
        const modelResponse = await fetch(`${FLEETYARDS_API}/models/${encodeURIComponent(slug)}`, {
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

    const fetchPage = async (pageNumberOrUrl: string) => {
        const targetUrl = String(pageNumberOrUrl).startsWith("http")
            ? pageNumberOrUrl
            : `${FLEETYARDS_API}/public/fleets/${encodeURIComponent(slug)}/vehicles?perPage=${encodeURIComponent(perPage)}&page=${encodeURIComponent(pageNumberOrUrl)}`;
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
