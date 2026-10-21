import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getMembers } from "@/app/lib/teamMembers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connection();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kmhq.org";
    const lastModified = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1.0 },
        { url: `${baseUrl}/news`, lastModified, changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/fleet`, lastModified, changeFrequency: "weekly", priority: 0.9 },
        { url: `${baseUrl}/team`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    ];

    const members = await getMembers(true).catch((error) => {
        console.error("Failed to fetch team members for sitemap:", error);
        return [];
    });
    const memberRoutes: MetadataRoute.Sitemap = members.map((member) => ({
        url: `${baseUrl}/team/${member.discord_uid}`,
        lastModified: new Date(member.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    return [...staticRoutes, ...memberRoutes];
}
