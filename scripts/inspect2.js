const { Client } = require("pg");
require("dotenv").config();

async function inspect2() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Show all columns of team_members
    const r1 = await client.query(
        `SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_name = 'team_members'
     ORDER BY ordinal_position`,
    );
    console.log("team_members columns:");
    r1.rows.forEach((r) => console.log(" ", r.column_name, "|", r.data_type, "|", r.column_default));

    // Check how Payload normally creates its tables — look at news_posts
    const r2 = await client.query(
        `SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_name = 'news_posts' AND column_name = 'id'`,
    );
    console.log("\nnews_posts.id:", JSON.stringify(r2.rows[0]));

    // Check users table
    const r3 = await client.query(
        `SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_name = 'users' AND column_name = 'id'`,
    );
    console.log("users.id:", JSON.stringify(r3.rows[0]));

    await client.end();
}
inspect2().catch(console.error);
