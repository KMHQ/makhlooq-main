import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

// Collections
import { Users } from "./src/payload/collections/Users";
import { Media } from "./src/payload/collections/Media";
import { NewsPosts } from "./src/payload/collections/NewsPosts";
import { Announcements } from "./src/payload/collections/Announcements";
import { FleetConfigs } from "./src/payload/collections/FleetConfigs";
import { TeamMembers } from "./src/payload/collections/TeamMembers";

// Globals
import { HomePage } from "./src/payload/globals/HomePage";
import { SiteSettings } from "./src/payload/globals/SiteSettings";
import { AboutPage, FleetPage, TeamPage } from "./src/payload/globals/OtherPages";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— KMHQ CMS",
      icons: [{ rel: "icon", url: "/favicon.ico" }],
    },
    livePreview: {
      url: ({ collectionConfig, globalConfig }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://kmhq.org';
        if (globalConfig) {
          if (globalConfig.slug === 'about-page') return `${baseUrl}/about`;
          if (globalConfig.slug === 'fleet-page') return `${baseUrl}/fleet`;
          if (globalConfig.slug === 'team-page') return `${baseUrl}/team`;
          if (globalConfig.slug === 'home-page') return `${baseUrl}/`;
        }
        if (collectionConfig) {
          if (collectionConfig.slug === 'news-posts') return `${baseUrl}/about`;
          if (collectionConfig.slug === 'team_members') return `${baseUrl}/team`;
          if (collectionConfig.slug === 'fleet_configs') return `${baseUrl}/fleet`;
        }
        return baseUrl;
      },
      collections: ['news-posts', 'team_members', 'fleet_configs'],
      globals: ['home-page', 'site-settings', 'about-page', 'fleet-page', 'team-page'],
    },
  },
  collections: [Users, Media, NewsPosts, Announcements, FleetConfigs, TeamMembers],
  globals: [HomePage, SiteSettings, AboutPage, FleetPage, TeamPage],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "KMHQ_DEFAULT_SECRET_CHANGE_ME",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 5,
    },
    push: false,
  }),
  upload: {
    limits: {
      fileSize: 20000000, // 20MB
    },
  },
});