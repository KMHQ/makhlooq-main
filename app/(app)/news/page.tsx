import type { Media } from "@/payload-types";
import { getGlobal, getNewsPosts, seoMetadata } from "@/lib/payload/queries";
import NewsPageClient from "./NewsPageClient";

const DEFAULT_HERO_BACKGROUND = "/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg";

export async function generateMetadata() {
    const newsPage = await getGlobal("news-page");
    return seoMetadata(newsPage?.seo, {
        title: "News & Intel | KHALAI MAKHLOOQ — Elite Star Citizen Organization",
        description:
            "Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command.",
        image: "/opengraph-image.jpg",
    });
}

export default async function Page() {
    const [newsPosts, siteSettings, newsPage] = await Promise.all([getNewsPosts(), getGlobal("site-settings"), getGlobal("news-page")]);

    // Preload the hero background and the first few cover images
    const coverUrls = newsPosts
        .map((post) => (typeof post.coverImage === "object" ? (post.coverImage as Media | null)?.url : null))
        .filter((url): url is string => Boolean(url));
    const preloadUrls = [newsPage?.hero?.backgroundImage || DEFAULT_HERO_BACKGROUND, ...coverUrls].slice(0, 8);

    return (
        <>
            {preloadUrls.map((url) => (
                <link key={url} rel="preload" as="image" href={url} />
            ))}
            <NewsPageClient newsPosts={newsPosts} siteSettings={siteSettings} newsPage={newsPage} />
        </>
    );
}
