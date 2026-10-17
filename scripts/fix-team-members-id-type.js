const { Client } = require("pg");
require("dotenv").config();

async function fixTeamMembersIdType() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log("Connected.\n");

    // Confirm what type team_members.id actually is
    const r1 = await client.query(
        `SELECT column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_name = 'team_members' AND column_name = 'id'`,
    );
    console.log("team_members.id type:", JSON.stringify(r1.rows[0]));

    // Confirm current type of the FK column
    const r2 = await client.query(
        `SELECT column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'team_members_id'`,
    );
    console.log("payload_locked_documents_rels.team_members_id type:", JSON.stringify(r2.rows[0]));

    // The FK column is uuid but Payload passes integers — we need it to be integer.
    // Drop the old column and re-add it with the correct type.
    try {
        // Drop existing FK constraint(s) referencing this column first
        const r3 = await client.query(
            `SELECT conname
       FROM pg_constraint c
       JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
       JOIN pg_class t ON t.oid = c.conrelid
       WHERE t.relname = 'payload_locked_documents_rels'
         AND a.attname = 'team_members_id'
         AND c.contype = 'f'`,
        );
        for (const row of r3.rows) {
            await client.query(`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "${row.conname}"`);
            console.log(`Dropped FK constraint: ${row.conname}`);
        }

        // Drop the column
        await client.query(`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "team_members_id"`);
        console.log("Dropped old team_members_id column (uuid).");

        // Re-add as integer with FK to team_members(id)
        await client.query(
            `ALTER TABLE "payload_locked_documents_rels"
       ADD COLUMN "team_members_id" integer
       REFERENCES "team_members"("id") ON DELETE CASCADE`,
        );
        console.log("Re-added team_members_id as integer FK → team_members(id).");

        // Recreate the index Payload expects on this column
        await client.query(
            `CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_team_members_id_idx"
       ON "payload_locked_documents_rels" ("team_members_id")`,
        );
        console.log("Recreated index on team_members_id.");
    } catch (err) {
        console.error("Error fixing column:", err.message);
        console.error(err);
    }

    // Verify
    const r4 = await client.query(
        `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'team_members_id'`,
    );
    console.log("\nAfter fix — team_members_id:", JSON.stringify(r4.rows[0]));

    // Test the failing query
    try {
        await client.query(
            `SELECT DISTINCT "payload_locked_documents"."id"
       FROM "payload_locked_documents"
       LEFT JOIN "payload_locked_documents_rels" "t"
         ON ("payload_locked_documents"."id" = "t"."parent_id" AND "t"."path" LIKE $1)
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
        console.log("\n✅ Query now succeeds! Admin panel should work.");
    } catch (err) {
        console.error("\n❌ Query still fails:", err.message);
    }

    await client.end();
}

fixTeamMembersIdType().catch(console.error);
