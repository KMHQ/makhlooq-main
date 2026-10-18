import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kmhq.org";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/fleet/admin", "/team/admin", "/team/profile", "/api"],
            },
            {
                userAgent: ["AhrefsBot", "SemrushBot", "DotBot", "MJ12bot"],
                disallow: "/",
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
