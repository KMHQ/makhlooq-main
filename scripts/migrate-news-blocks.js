/**
 * migrate-news-blocks.js
 *
 * Creates the block tables Payload needs for the new NewsPosts content blocks,
 * and adds the new author columns to the news_posts table.
 *
 * Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
 */

const { Client } = require("pg");
require("dotenv").config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log("Connected.\n");

    // ── 1. Inspect current news_posts columns ──────────────────────────────────
    const { rows: existingCols } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'news_posts'
    ORDER BY ordinal_position
  `);
    console.log("Current news_posts columns:");
    existingCols.forEach((r) => console.log(" ", r.column_name, "|", r.data_type));
    console.log();

    // ── 2. Add new columns to news_posts ──────────────────────────────────────
    const newsCols = [
        `ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "author_source" text DEFAULT 'external'`,
        // team_members uses uuid PK, store as text so no FK type mismatch
        `ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "author_member_id" text`,
        `ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "author_external" text`,
        // legacy field, may already exist
        `ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "author_handle" text`,
    ];

    for (const sql of newsCols) {
        try {
            await client.query(sql);
            console.log("✅", sql.replace('ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS ', "").split(" ")[0]);
        } catch (err) {
            console.log("⚠", err.message);
        }
    }
    console.log();

    // ── 3. Create block child tables ──────────────────────────────────────────

    // text block
    await client.query(`
    CREATE TABLE IF NOT EXISTS "news_posts_blocks_text_block" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_path"       text    NOT NULL DEFAULT 'contentBlocks',
      "_parent_id"  integer NOT NULL REFERENCES "news_posts"("id") ON DELETE CASCADE,
      "content"     jsonb,
      "block_name"  text
    )
  `);
    await client.query(`
    CREATE INDEX IF NOT EXISTS "news_posts_blocks_text_block_parent_idx"
    ON "news_posts_blocks_text_block" ("_parent_id", "_order")
  `);
    console.log("✅ news_posts_blocks_text_block");

    // image block
    await client.query(`
    CREATE TABLE IF NOT EXISTS "news_posts_blocks_image_block" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_path"       text    NOT NULL DEFAULT 'contentBlocks',
      "_parent_id"  integer NOT NULL REFERENCES "news_posts"("id") ON DELETE CASCADE,
      "image_id"    integer REFERENCES "media"("id") ON DELETE SET NULL,
      "caption"     text,
      "full_width"  boolean DEFAULT false,
      "block_name"  text
    )
  `);
    await client.query(`
    CREATE INDEX IF NOT EXISTS "news_posts_blocks_image_block_parent_idx"
    ON "news_posts_blocks_image_block" ("_parent_id", "_order")
  `);
    console.log("✅ news_posts_blocks_image_block");

    // video block
    await client.query(`
    CREATE TABLE IF NOT EXISTS "news_posts_blocks_video_block" (
      "id"            serial PRIMARY KEY,
      "_order"        integer NOT NULL,
      "_path"         text    NOT NULL DEFAULT 'contentBlocks',
      "_parent_id"    integer NOT NULL REFERENCES "news_posts"("id") ON DELETE CASCADE,
      "video_source"  text DEFAULT 'upload',
      "video_file_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "video_url"     text,
      "caption"       text,
      "autoplay"      boolean DEFAULT false,
      "block_name"    text
    )
  `);
    await client.query(`
    CREATE INDEX IF NOT EXISTS "news_posts_blocks_video_block_parent_idx"
    ON "news_posts_blocks_video_block" ("_parent_id", "_order")
  `);
    console.log("✅ news_posts_blocks_video_block");

    // embed block
    await client.query(`
    CREATE TABLE IF NOT EXISTS "news_posts_blocks_embed_block" (
      "id"          serial PRIMARY KEY,
      "_order"      integer NOT NULL,
      "_path"       text    NOT NULL DEFAULT 'contentBlocks',
      "_parent_id"  integer NOT NULL REFERENCES "news_posts"("id") ON DELETE CASCADE,
      "url"         text,
      "caption"     text,
      "block_name"  text
    )
  `);
    await client.query(`
    CREATE INDEX IF NOT EXISTS "news_posts_blocks_embed_block_parent_idx"
    ON "news_posts_blocks_embed_block" ("_parent_id", "_order")
  `);
    console.log("✅ news_posts_blocks_embed_block");

    // ── 4. Quick smoke test ──────────────────────────────────────────────────
    console.log("\nRunning smoke-test query...");
    try {
        await client.query(`
      SELECT "news_posts"."id"
      FROM "news_posts"
      LEFT JOIN LATERAL (
        SELECT coalesce(json_agg(t), '[]'::json) as data
        FROM "news_posts_blocks_text_block" t
        WHERE t."_parent_id" = "news_posts"."id"
      ) tb ON true
      LEFT JOIN LATERAL (
        SELECT coalesce(json_agg(i), '[]'::json) as data
        FROM "news_posts_blocks_image_block" i
        WHERE i."_parent_id" = "news_posts"."id"
      ) ib ON true
      LEFT JOIN LATERAL (
        SELECT coalesce(json_agg(v), '[]'::json) as data
        FROM "news_posts_blocks_video_block" v
        WHERE v."_parent_id" = "news_posts"."id"
      ) vb ON true
      LEFT JOIN LATERAL (
        SELECT coalesce(json_agg(e), '[]'::json) as data
        FROM "news_posts_blocks_embed_block" e
        WHERE e."_parent_id" = "news_posts"."id"
      ) eb ON true
      ORDER BY "news_posts"."created_at" DESC
      LIMIT 5
    `);
        console.log("✅ Smoke test passed — all block tables are queryable.");
    } catch (err) {
        console.error("❌ Smoke test failed:", err.message);
    }

    await client.end();
    console.log("\nMigration complete. Restart your dev server.");
}

migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
