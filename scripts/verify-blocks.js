const { Client } = require('pg');
require('dotenv').config();

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const tables = [
    'news_posts_blocks_text_block',
    'news_posts_blocks_image_block',
    'news_posts_blocks_video_block',
    'news_posts_blocks_embed_block',
  ];

  for (const t of tables) {
    const { rows } = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = $1
       ) as exists`, [t]
    );
    console.log(rows[0].exists ? `✅ ${t}` : `❌ MISSING: ${t}`);
  }

  // Also print the DB host we're connected to
  const { rows: db } = await client.query(`SELECT current_database(), inet_server_addr(), inet_server_port()`);
  console.log('\nConnected to:', JSON.stringify(db[0]));
  await client.end();
}
verify().catch(console.error);
