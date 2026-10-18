import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

async function getApprovedMembers() {
    "use cache";
    cacheLife("hours");
    cacheTag("team-members");

    const { data, error } = await supabase.from("team_members").select("discord_uid, updated_at").eq("is_approved", true);
    if (error) throw error;
    return data;
}

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

    const members = await getApprovedMembers().catch((error) => {
        console.error("Failed to fetch team members for sitemap:", error);
        return [];
    });
    const memberRoutes: MetadataRoute.Sitemap = members.map((member) => ({
        url: `${baseUrl}/team/${member.discord_uid}`,
        lastModified: new Date(member.updated_at),
        changeFrequency: "monthly",
        priority: 0.8,
    }));

    return [...staticRoutes, ...memberRoutes];
}
