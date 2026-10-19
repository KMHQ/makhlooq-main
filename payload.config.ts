import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Collections
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { NewsPosts } from "./collections/NewsPosts";
import { Announcements } from "./collections/Announcements";
import { FleetConfigs } from "./collections/FleetConfigs";
import { TeamMembers } from "./collections/TeamMembers";

// Globals
import { HomePage } from "./globals/HomePage";
import { SiteSettings } from "./globals/SiteSettings";
import { NewsPage, FleetPage, TeamPage } from "./globals/OtherPages";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    admin: {
        user: Users.slug,
        importMap: {
            baseDir: path.resolve(dirname),
        },
        suppressHydrationWarning: true,
        meta: {
            titleSuffix: "— KMHQ CMS",
            icons: [{ rel: "icon", url: "/favicon.ico" }],
        },
        livePreview: {
            url: ({ collectionConfig, globalConfig }) => {
                const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org";
                if (globalConfig) {
                    if (globalConfig.slug === "news-page") return `${baseUrl}/news`;
                    if (globalConfig.slug === "fleet-page") return `${baseUrl}/fleet`;
                    if (globalConfig.slug === "team-page") return `${baseUrl}/team`;
                    if (globalConfig.slug === "home-page") return `${baseUrl}/`;
                }
                if (collectionConfig) {
                    if (collectionConfig.slug === "news-posts") return `${baseUrl}/news`;
                    if (collectionConfig.slug === "team_members") return `${baseUrl}/team`;
                    if (collectionConfig.slug === "fleet_configs") return `${baseUrl}/fleet`;
                }
                return baseUrl;
            },
            collections: ["news-posts", "team_members", "fleet_configs"],
            globals: ["home-page", "site-settings", "news-page", "fleet-page", "team-page"],
        },
    },
    collections: [Users, Media, NewsPosts, Announcements, FleetConfigs, TeamMembers],
    globals: [HomePage, SiteSettings, NewsPage, FleetPage, TeamPage],
    editor: lexicalEditor(),
    secret: process.env.PAYLOAD_SECRET || "",
    typescript: {
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.DATABASE_URL || "",
            max: 5,
        },
        push: false,
    }),
    sharp,
    upload: {
        limits: {
            fileSize: 20000000, // 20MB
        },
    },
});
