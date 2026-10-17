const { Client } = require("pg");
require("dotenv").config();

async function fixSchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is not set in environment.");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL database.");

        const tables = ["site_settings", "about_page", "fleet_page", "team_page", "home_page"];

        for (const table of tables) {
            await client.query(`
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_title" text;
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_description" text;
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_image_url" text;
      `);
        }

        // Add sub_capital to enum_fleet_configs_fleet_type if enum exists
        try {
            await client.query(`
        ALTER TYPE "enum_fleet_configs_fleet_type" ADD VALUE IF NOT EXISTS 'sub_capital';
      `);
            console.log('Added "sub_capital" to enum_fleet_configs_fleet_type.');
        } catch (e) {
            console.log("Note on enum alter:", e.message);
        }

        // Drop unique constraint on fleet_configs(slug) so duplicate slugs with custom names are allowed
        try {
            await client.query(`DROP INDEX IF EXISTS "fleet_configs_slug_idx";`);
            await client.query(`ALTER TABLE "fleet_configs" DROP CONSTRAINT IF EXISTS "fleet_configs_slug_idx";`);
            await client.query(`ALTER TABLE "fleet_configs" DROP CONSTRAINT IF EXISTS "fleet_configs_slug_key";`);
            console.log("Dropped unique constraint fleet_configs_slug_idx.");
        } catch (e) {
            console.log("Note on index drop:", e.message);
        }

        // Ensure team_members columns exist
        await client.query(`
      ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
      ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now();
    `);

        // Ensure fleet_configs columns exist
        await client.query(`
      ALTER TABLE "fleet_configs" ADD COLUMN IF NOT EXISTS "fleet_type" text DEFAULT 'small';
      ALTER TABLE "fleet_configs" ADD COLUMN IF NOT EXISTS "ceo_name" text;
      ALTER TABLE "fleet_configs" ADD COLUMN IF NOT EXISTS "ceo_discord_uid" text;
      ALTER TABLE "fleet_configs" ADD COLUMN IF NOT EXISTS "quantity" integer DEFAULT 1;
    `);

        console.log("Successfully updated all database schemas & enums.");
    } catch (err) {
        console.error("Error fixing database schema:", err);
    } finally {
        await client.end();
    }
}

fixSchema();
