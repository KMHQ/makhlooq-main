import { NextResponse, type NextRequest } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { errorMessage } from "@/lib/errors";
import { FLEETYARDS_API, getNextLink, type FleetYardsError } from "@/lib/fleetyards";

async function readJson(response: Response): Promise<(FleetYardsError & { items?: unknown[] }) | null> {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return { error: text };
    }
}

async function fetchAllModels(perPage: string, page: string) {
    const collected: unknown[] = [];
    let currentPageOrUrl = page;
    let pagesFetched = 0;

    while (true) {
        const targetUrl = String(currentPageOrUrl).startsWith("http")
            ? currentPageOrUrl
            : `${FLEETYARDS_API}/models?perPage=${encodeURIComponent(perPage)}&page=${encodeURIComponent(currentPageOrUrl)}`;
        const response = await fetch(targetUrl, { headers: { Accept: "application/json" } });
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
}

async function fetchModel(slug: string) {
    const response = await fetch(`${FLEETYARDS_API}/models/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } });
    const data = await readJson(response);

    if (!response.ok) {
        return { slug, error: data?.message || data?.error || `FleetYards API error (${response.status})` };
    }

    return data;
}

async function getAllModels(perPage: string, page: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("fleetyards");
    return fetchAllModels(perPage, page);
}

async function getModel(slug: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("fleetyards");
    return fetchModel(slug);
}

// `fresh=1` bypasses the cache (used by the admin page to pull new FleetYards data).
export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl;
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

            return NextResponse.json(await (fresh ? fetchAllModels : getAllModels)(perPage, page));
        }

        const models = await Promise.all(slugs.map((slug) => (fresh ? fetchModel : getModel)(slug)));

        return NextResponse.json({ items: models });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error, "Unexpected FleetYards model fetch error") }, { status: 500 });
    }
}
