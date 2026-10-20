declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // ------------------------------------------------------------
            // Site
            // ------------------------------------------------------------

            /** Public site URL for OAuth redirects and absolute URLs. Defaults to https://kmhq.org. */
            NEXT_PUBLIC_SITE_URL?: string;
            /** Base URL for Payload live preview. Defaults to https://kmhq.org. */
            NEXT_PUBLIC_SERVER_URL?: string;

            // ------------------------------------------------------------
            // Payload
            // ------------------------------------------------------------

            /** Signs Payload auth tokens and encrypts its secrets. */
            PAYLOAD_SECRET: string;

            // ------------------------------------------------------------
            // Supabase
            // ------------------------------------------------------------

            /** Supabase project URL. */
            NEXT_PUBLIC_SUPABASE_URL: string;
            /** Supabase service role key used by the server client. */
            SUPABASE_SERVICE_ROLE_KEY: string;
            /** Supabase anon key, used only when SUPABASE_SERVICE_ROLE_KEY is unset. */
            NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
            /** Postgres connection string for the Payload adapter. */
            DATABASE_URL: string;

            // ------------------------------------------------------------
            // Discord
            // ------------------------------------------------------------

            /** Discord OAuth2 client ID. */
            DISCORD_CLIENT_ID: string;
            /** Discord OAuth2 client secret. */
            DISCORD_CLIENT_SECRET: string;
            /** Discord bot token for guild membership checks. */
            DISCORD_BOT_TOKEN: string;
            /** Discord server (guild) ID. */
            DISCORD_GUILD_ID: string;

            // ------------------------------------------------------------
            // Admin
            // ------------------------------------------------------------

            /** Comma-separated Discord user IDs with super-admin access. */
            ADMIN_DISCORD_IDS?: string;
            /** Signs admin session cookies. Falls back to DISCORD_CLIENT_SECRET. */
            ADMIN_SESSION_SECRET?: string;

            // ------------------------------------------------------------
            // FleetYards
            // ------------------------------------------------------------

            /** Comma-separated FleetYards fleet slugs shown before they have a DB row. */
            FLEETYARDS_FLEET_SLUGS?: string;
        }
    }
}

export {};
