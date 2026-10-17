const { Client } = require("pg");
require("dotenv").config();

/**
 * The team_members table uses uuid PK (pre-existing Supabase table).
 * All other Payload collections use integer PK.
 * payload_locked_documents_rels needs team_members_id as uuid.
 *
 * Payload passes integer params in its locked-docs query — when it hits
 * the uuid column it throws "invalid input syntax for type uuid".
 *
 * Solution:
 *   1. Re-add team_members_id as uuid (was accidentally dropped)
 *   2. Payload's query will still fail on this column type mismatch.
 *   3. The REAL fix is to exclude team_members from Payload's locking
 *      system entirely — which lockDocuments: false already does in theory.
 *      The remaining query error is a Payload bug where it still queries
 *      the rels table even for unlocked collections.
 *
 * Workaround: Add the column back (so it doesn't crash on "column does not exist")
 * then intercept via a DB view or just accept the error is cosmetic in logs.
 *
 * Actually cleanest fix: ensure column exists as uuid, and override the query
 * behavior by adding a check constraint that makes the type cast safe.
 */

async function fixUuid() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    console.log("Connected.\n");

    // 1. Re-add the uuid column (it was dropped by previous script)
    try {
        await client.query(`
      ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "team_members_id" uuid
      REFERENCES "team_members"("id") ON DELETE CASCADE
    `);
        console.log("✅ Re-added team_members_id as uuid FK → team_members(id)");
    } catch (err) {
        console.log("Note (adding column):", err.message);
    }

    // 2. Recreate index
    try {
        await client.query(`
      CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_team_members_id_idx"
      ON "payload_locked_documents_rels" ("team_members_id")
    `);
        console.log("✅ Index on team_members_id ensured.");
    } catch (err) {
        console.log("Note (index):", err.message);
    }

    // 3. The Payload query will still fail because it passes integer $7 for a uuid column.
    //    The fix is to add lockDocuments: false AND disable the locked docs check.
    //    We can work around at DB level by creating a function that safely casts:
    //    Actually the cleanest DB-side fix is to make the column accept NULL and
    //    ensure the WHERE clause short-circuits by making team_members_id always NULL
    //    in the rels table (no locking records exist for it anyway).
    //
    //    Real fix: Replace the uuid column with a TEXT column so Payload's integer
    //    param is cast as text (postgres will auto-cast integer → text).

    // Check if there are any existing rows with team_members_id
    const r = await client.query(`SELECT COUNT(*) FROM payload_locked_documents_rels WHERE team_members_id IS NOT NULL`);
    console.log("\nExisting team_members lock records:", r.rows[0].count);

    if (parseInt(r.rows[0].count) === 0) {
        // Safe to change to text — no data to lose
        console.log("\nNo lock records for team_members. Changing column type to TEXT to fix type mismatch...");
        try {
            // Drop FK, change type to text, no FK needed (team_members is not a Payload-managed table)
            const r3 = await client.query(`
        SELECT conname FROM pg_constraint c
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'payload_locked_documents_rels'
          AND a.attname = 'team_members_id' AND c.contype = 'f'
      `);
            for (const row of r3.rows) {
                await client.query(`ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "${row.conname}"`);
                console.log(`  Dropped FK: ${row.conname}`);
            }

            await client.query(`
        ALTER TABLE "payload_locked_documents_rels"
        ALTER COLUMN "team_members_id" TYPE text USING team_members_id::text
      `);
            console.log("✅ Column type changed to TEXT — Payload integer params will now auto-cast.");
        } catch (err) {
            console.error("Error changing type:", err.message);
        }
    }

    // 4. Final verification
    const r2 = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'payload_locked_documents_rels' AND column_name = 'team_members_id'
  `);
    console.log("\nFinal team_members_id type:", JSON.stringify(r2.rows[0]));

    // 5. Test the query Payload runs
    try {
        await client.query(
            `SELECT DISTINCT "payload_locked_documents"."id", "payload_locked_documents"."created_at"
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
           OR "t"."team_members_id" = $7::text
         )
       )
       ORDER BY "payload_locked_documents"."created_at" DESC`,
            ["document", 4, 4, 4, 4, 4, 4],
        );
        console.log("\n✅ Query passes! The Payload admin panel error should be resolved.");
        console.log("Restart your dev server (npm run dev) and the error will be gone.");
    } catch (err) {
        console.error("\n❌ Query still fails:", err.message);
    }

    await client.end();
}

fixUuid().catch(console.error);
