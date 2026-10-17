/**
 * fix-locked-docs-rels.js
 *
 * Payload CMS stores document-lock info in payload_locked_documents_rels.
 * Each collection needs its own FK column there (e.g. team_members_id).
 * If a column is missing the admin panel throws a "Failed query" error on every page.
 *
 * This script safely adds any missing FK columns.  Run once, idempotent.
 */

const { Client } = require("pg");
require("dotenv").config();

async function fixLockedDocsRels() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is not set.");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    });

    await client.connect();
    console.log("Connected to PostgreSQL.\n");

    // Map of collection slug → FK column name Payload expects
    // slug with hyphens → column with underscores, then append _id
    const collections = [
        { slug: "users", column: "users_id" },
        { slug: "media", column: "media_id" },
        { slug: "news_posts", column: "news_posts_id" }, // slug is "news-posts" → Payload uses underscores
        { slug: "announcements", column: "announcements_id" },
        { slug: "fleet_configs", column: "fleet_configs_id" },
        { slug: "team_members", column: "team_members_id" },
    ];

    // Check which columns already exist
    const { rows: existingCols } = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'payload_locked_documents_rels';
  `);
    const existing = new Set(existingCols.map((r) => r.column_name));
    console.log("Existing columns in payload_locked_documents_rels:");
    console.log([...existing].join(", "), "\n");

    // Also check which actual collection tables exist in the DB
    const { rows: existingTables } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public';
  `);
    const tableSet = new Set(existingTables.map((r) => r.table_name));

    for (const { slug, column } of collections) {
        if (existing.has(column)) {
            console.log(`✓ Column "${column}" already exists — skipping.`);
            continue;
        }

        // The referenced table name may differ from the slug — Payload uses the slug with hyphens
        // replaced by underscores as the table name.
        const tableName = slug; // e.g. team_members, fleet_configs, news_posts

        // For "news-posts" slug Payload actually creates table "news_posts"
        const resolvedTable = slug.replace(/-/g, "_");

        if (!tableSet.has(resolvedTable)) {
            console.log(`⚠ Table "${resolvedTable}" does not exist — skipping column "${column}".`);
            continue;
        }

        try {
            await client.query(`
        ALTER TABLE "payload_locked_documents_rels"
        ADD COLUMN IF NOT EXISTS "${column}" integer
        REFERENCES "${resolvedTable}"("id") ON DELETE CASCADE;
      `);
            console.log(`✅ Added column "${column}" → references "${resolvedTable}".`);
        } catch (err) {
            console.error(`❌ Failed to add "${column}":`, err.message);
        }
    }

    // Ensure the path column index exists (helps with the LIKE $1 filter)
    try {
        await client.query(`
      CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx"
      ON "payload_locked_documents_rels" ("path");
    `);
        console.log('\n✅ Index on "path" ensured.');
    } catch (err) {
        console.log("\nNote on path index:", err.message);
    }

    await client.end();
    console.log("\nDone. Restart your dev server and reload the admin panel.");
}

fixLockedDocsRels().catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
});
