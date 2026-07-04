const { Client } = require('pg');
require('dotenv').config();

async function fixSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    const tables = ['site_settings', 'about_page', 'fleet_page', 'team_page', 'home_page'];
    
    for (const table of tables) {
      console.log(`Checking table "${table}"...`);
      await client.query(`
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_title" text;
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_description" text;
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "seo_image_url" text;
      `);
    }

    // Site settings columns
    const siteSettingsQueries = [
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_org_name" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_org_short_name" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_description" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_status_badge1" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_status_badge2" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_nav_section_label" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_comms_section_label" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_email_address" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_discord_link" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_discord_link_text" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_signal_log1" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_signal_log2" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_signal_log3" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_copyright" text;`,
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "discord_url" text;`,
    ];

    for (const q of siteSettingsQueries) {
      await client.query(q);
    }
    console.log('Successfully updated columns across all tables.');

  } catch (err) {
    console.error('Error fixing database schema:', err);
  } finally {
    await client.end();
  }
}

fixSchema();
