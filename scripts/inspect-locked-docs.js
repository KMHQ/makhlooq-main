const { Client } = require("pg");
require("dotenv").config();

async function inspect() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    const r1 = await client.query("SELECT COUNT(*) FROM payload_locked_documents");
    console.log("locked_docs rows:", r1.rows[0].count);

    const r2 = await client.query(
        `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'payload_locked_documents_rels' 
     ORDER BY ordinal_position`,
    );
    console.log("\npayload_locked_documents_rels columns:");
    r2.rows.forEach((row) => console.log(" -", row.column_name, ":", row.data_type));

    // Try the failing query directly
    try {
        const r3 = await client.query(
            `SELECT DISTINCT "payload_locked_documents"."id"
       FROM "payload_locked_documents"
       LEFT JOIN "payload_locked_documents_rels" "t"
         ON ("payload_locked_documents"."id" = "t"."parent_id"
             AND "t"."path" LIKE $1)
       WHERE (
         "t"."news_posts_id" IS NOT NULL
         AND (
           "t"."users_id" = $2
           OR "t"."media_id" = $3
           OR "t"."news_posts_id" = $4
           OR "t"."announcements_id" = $5
           OR "t"."fleet_configs_id" = $6
           OR "t"."team_members_id" = $7
         )
       )
       ORDER BY "payload_locked_documents"."id" DESC`,
            ["document", 1, 1, 1, 1, 1, 1],
        );
        console.log("\nQuery succeeded! Rows:", r3.rowCount);
    } catch (err) {
        console.error("\nQuery FAILED:", err.message);
        console.error("Detail:", err.detail);
        console.error("Hint:", err.hint);
    }

    await client.end();
}

inspect().catch(console.error);
