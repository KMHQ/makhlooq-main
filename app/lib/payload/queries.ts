import type { Metadata } from "next";
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import type { Config } from "@/payload-types";
import { getPayloadInstance } from "./index";

type GlobalSlug = keyof Config["globals"];

export type PageData<T extends GlobalSlug> = Config["globals"][T] & { siteSettings: Config["globals"]["site-settings"] | null };
type Seo = { title?: string | null; description?: string | null; imageUrl?: string | null } | undefined;

// Cached for an hour, and expired immediately when the global is saved in Payload
// (see hooks/revalidate.ts). Errors propagate so a failed fetch is never cached.
async function fetchGlobal<T extends GlobalSlug>(slug: T): Promise<Config["globals"][T]> {
    "use cache";
    cacheLife("hours");
    cacheTag(`global:${slug}`);

    const payload = await getPayloadInstance();
    return (await payload.findGlobal({ slug })) as Config["globals"][T];
}

async function fetchNewsPosts() {
    "use cache";
    cacheLife("hours");
    cacheTag("news-posts");

    const payload = await getPayloadInstance();
    const result = await payload.find({ collection: "news-posts", sort: "-publishedAt", limit: 100, depth: 3 });
    return result.docs;
}

// CMS pages render per request (the build never needs database access); the data itself comes from
// the cache above. On failure, render with fallbacks rather than erroring.
async function withFallback<T>(load: () => Promise<T>, fallback: T, label: string): Promise<T> {
    await connection();
    try {
        return await load();
    } catch (error) {
        console.error(`Failed to fetch ${label}:`, error);
        return fallback;
    }
}

export function getGlobal<T extends GlobalSlug>(slug: T): Promise<Config["globals"][T] | null> {
    return withFallback(() => fetchGlobal(slug), null, `Payload global "${slug}"`);
}

export function getNewsPosts() {
    return withFallback(fetchNewsPosts, [], "news posts");
}

// A page global merged with the site settings, which is what the *PageClient components expect.
export async function getPageData<T extends GlobalSlug>(slug: T): Promise<PageData<T> | null> {
    const [page, siteSettings] = await Promise.all([getGlobal(slug), getGlobal("site-settings")]);
    return page ? { ...page, siteSettings } : null;
}

const usable = (value: string | null | undefined) => {
    const text = value?.trim();
    return text && text !== "Untitled" ? text : null;
};

// Page metadata from a Payload `seo` group, falling back to the given defaults.
export function seoMetadata(seo: Seo, defaults: { title: string; description: string; image?: string }): Metadata {
    const title = usable(seo?.title) ?? defaults.title;
    const description = usable(seo?.description) ?? defaults.description;
    const image = usable(seo?.imageUrl) ?? defaults.image;

    return {
        title,
        description,
        openGraph: { title, description, images: image ? [{ url: image }] : [] },
        twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    };
}
