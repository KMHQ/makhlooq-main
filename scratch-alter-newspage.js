const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.ptfkbrghslaxyfxaudxv:KaBTr!Jt)PSYW4@@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
  });

  await client.connect();

  console.log("Connected to database. Adding category hero columns to news_page table...");

  try {
    await client.query(`
      ALTER TABLE "news_page" 
      ADD COLUMN IF NOT EXISTS "announcement_hero_kicker" text,
      ADD COLUMN IF NOT EXISTS "announcement_hero_heading" text,
      ADD COLUMN IF NOT EXISTS "announcement_hero_tagline" text,
      ADD COLUMN IF NOT EXISTS "announcement_hero_background_image" text,
      ADD COLUMN IF NOT EXISTS "ops_hero_kicker" text,
      ADD COLUMN IF NOT EXISTS "ops_hero_heading" text,
      ADD COLUMN IF NOT EXISTS "ops_hero_tagline" text,
      ADD COLUMN IF NOT EXISTS "ops_hero_background_image" text,
      ADD COLUMN IF NOT EXISTS "fleet_hero_kicker" text,
      ADD COLUMN IF NOT EXISTS "fleet_hero_heading" text,
      ADD COLUMN IF NOT EXISTS "fleet_hero_tagline" text,
      ADD COLUMN IF NOT EXISTS "fleet_hero_background_image" text,
      ADD COLUMN IF NOT EXISTS "lore_hero_kicker" text,
      ADD COLUMN IF NOT EXISTS "lore_hero_heading" text,
      ADD COLUMN IF NOT EXISTS "lore_hero_tagline" text,
      ADD COLUMN IF NOT EXISTS "lore_hero_background_image" text,
      ADD COLUMN IF NOT EXISTS "community_hero_kicker" text,
      ADD COLUMN IF NOT EXISTS "community_hero_heading" text,
      ADD COLUMN IF NOT EXISTS "community_hero_tagline" text,
      ADD COLUMN IF NOT EXISTS "community_hero_background_image" text;
    `);
    console.log("Successfully added all category hero columns to 'news_page' table.");
  } catch (err) {
    console.error("Failed to alter table:", err);
  } finally {
    await client.end();
  }
}

main();
