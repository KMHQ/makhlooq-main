import { MetadataRoute } from "next";

/**
 * ▸ ROBOTS.TXT CONFIGURATION
 * SEO: Tells search engines which pages to crawl and which to ignore
 * Improves: Crawlability, indexation efficiency
 *
 * Documentation: https://developers.google.com/search/docs/beginner/robots-txt
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kmhq.org";

    return {
        rules: [
            {
                userAgent: "*", // Applies to all search engine bots
                allow: ["/", "/fleet", "/team", "/team/profile"],
                disallow: [
                    "/fleet/admin", // Prevent admin pages from indexing
                    "/team/admin",
                    "/api", // API routes should not be indexed
                    "/*.json$", // Don't index JSON files
                    "/sitemap.xml", // Don't index sitemap itself
                ],
                crawlDelay: 1, // Wait 1 second between requests (be nice to server)
            },

            // ▸ SPECIFIC RULES FOR GOOGLEBOT (More aggressive crawling)
            {
                userAgent: "Googlebot",
                allow: "/",
                crawlDelay: 0, // Google can crawl more frequently
            },

            // ▸ BLOCK BAD BOTS
            {
                userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot"],
                disallow: "/",
            },
        ],

        // ▸ SITEMAP LOCATION
        sitemap: `${baseUrl}/sitemap.xml`,

        // ▸ CRAWL DELAY FOR UNKNOWN BOTS
        host: baseUrl,
    };
}
