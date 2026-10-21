import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

// The production database was built by Payload's dev push plus hand-written SQL, so it drifted from the
// collections. The baseline migration is recorded as applied there without running; this migration brings
// the existing tables in line with it. On a fresh database (where the baseline did run) every statement
// is a no-op or skipped by the guard below.
export async function up({ db }: MigrateUpArgs): Promise<void> {
    const { rows } = await db.execute(sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'id'
  `);
    if (rows[0]?.data_type !== "uuid") return;

    await db.execute(sql`
  -- team_members: renumber the uuid primary key to Payload's serial integer id, oldest member first.
  ALTER TABLE "team_members" DROP CONSTRAINT "team_members_pkey";
  ALTER TABLE "team_members" RENAME COLUMN "id" TO "legacy_uuid";
  ALTER TABLE "team_members" ADD COLUMN "id" integer;
  UPDATE "team_members" t SET "id" = s.rn
    FROM (SELECT "legacy_uuid", row_number() OVER (ORDER BY "joined_at" NULLS LAST, "created_at" NULLS LAST, "discord_uid") AS rn FROM "team_members") s
    WHERE t."legacy_uuid" = s."legacy_uuid";
  CREATE SEQUENCE "team_members_id_seq" OWNED BY "team_members"."id";
  SELECT setval('team_members_id_seq', COALESCE((SELECT max("id") FROM "team_members"), 0) + 1, false);
  ALTER TABLE "team_members"
    ALTER COLUMN "id" SET DEFAULT nextval('team_members_id_seq'::regclass),
    ALTER COLUMN "id" SET NOT NULL,
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");

  -- news_posts.author_member_id held team member uuids as text; map them to the new ids.
  ALTER TABLE "news_posts" ADD COLUMN "author_member_id_new" integer;
  UPDATE "news_posts" n SET "author_member_id_new" = t."id" FROM "team_members" t WHERE n."author_member_id" = t."legacy_uuid"::text;
  ALTER TABLE "news_posts" DROP COLUMN "author_member_id";
  ALTER TABLE "news_posts" RENAME COLUMN "author_member_id_new" TO "author_member_id";
  ALTER TABLE "news_posts" ALTER COLUMN "author_external" SET DATA TYPE varchar;
  ALTER TABLE "team_members" DROP COLUMN "legacy_uuid";

  -- team_members: column types, defaults and constraints as Payload defines them.
  UPDATE "team_members" SET "created_at" = now() WHERE "created_at" IS NULL;
  UPDATE "team_members" SET "updated_at" = now() WHERE "updated_at" IS NULL;
  ALTER TABLE "team_members"
    DROP COLUMN "skills",
    ALTER COLUMN "discord_uid" SET DATA TYPE varchar,
    ALTER COLUMN "discord_tag" SET DATA TYPE varchar,
    ALTER COLUMN "name" SET DATA TYPE varchar,
    ALTER COLUMN "role" SET DATA TYPE varchar,
    ALTER COLUMN "role" SET DEFAULT 'KMHQ',
    ALTER COLUMN "flair_color" SET DATA TYPE varchar,
    ALTER COLUMN "flair_color" SET DEFAULT '#10b981',
    ALTER COLUMN "avatar_url" SET DATA TYPE varchar,
    ALTER COLUMN "node_color" SET DATA TYPE varchar,
    ALTER COLUMN "node_color" SET DEFAULT '#10b981',
    ALTER COLUMN "bio" SET DATA TYPE varchar,
    ALTER COLUMN "flair_icon" DROP DEFAULT,
    ALTER COLUMN "category" DROP DEFAULT,
    ALTER COLUMN "sec_level" DROP DEFAULT,
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "flair_icon" SET DATA TYPE "public"."enum_team_members_flair_icon" USING "flair_icon"::"public"."enum_team_members_flair_icon",
    ALTER COLUMN "category" SET DATA TYPE "public"."enum_team_members_category" USING "category"::"public"."enum_team_members_category",
    ALTER COLUMN "sec_level" SET DATA TYPE "public"."enum_team_members_sec_level" USING "sec_level"::"public"."enum_team_members_sec_level",
    ALTER COLUMN "status" SET DATA TYPE "public"."enum_team_members_status" USING "status"::"public"."enum_team_members_status",
    ALTER COLUMN "flair_icon" SET DEFAULT 'zap',
    ALTER COLUMN "category" SET DEFAULT 'Makhlooq',
    ALTER COLUMN "sec_level" SET DEFAULT 'R0',
    ALTER COLUMN "status" SET DEFAULT 'active',
    ALTER COLUMN "joined_at" SET DATA TYPE timestamp(3) with time zone,
    ALTER COLUMN "joined_at" DROP DEFAULT,
    ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3) with time zone,
    ALTER COLUMN "updated_at" SET NOT NULL,
    ALTER COLUMN "created_at" SET DATA TYPE timestamp(3) with time zone,
    ALTER COLUMN "created_at" SET NOT NULL;
  CREATE UNIQUE INDEX "team_members_discord_uid_idx" ON "team_members" USING btree ("discord_uid");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_author_member_id_team_members_id_fk" FOREIGN KEY ("author_member_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_posts_author_member_idx" ON "news_posts" USING btree ("author_member_id");

  -- news_posts blocks: foreign keys and indexes the dev push never created.
  ALTER TABLE "news_posts_blocks_text_block" ADD CONSTRAINT "news_posts_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_image_block" ADD CONSTRAINT "news_posts_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_image_block" ADD CONSTRAINT "news_posts_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_video_block" ADD CONSTRAINT "news_posts_blocks_video_block_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_video_block" ADD CONSTRAINT "news_posts_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_embed_block" ADD CONSTRAINT "news_posts_blocks_embed_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "news_posts_blocks_text_block_order_idx" ON "news_posts_blocks_text_block" USING btree ("_order");
  CREATE INDEX "news_posts_blocks_text_block_parent_id_idx" ON "news_posts_blocks_text_block" USING btree ("_parent_id");
  CREATE INDEX "news_posts_blocks_text_block_path_idx" ON "news_posts_blocks_text_block" USING btree ("_path");
  CREATE INDEX "news_posts_blocks_image_block_order_idx" ON "news_posts_blocks_image_block" USING btree ("_order");
  CREATE INDEX "news_posts_blocks_image_block_parent_id_idx" ON "news_posts_blocks_image_block" USING btree ("_parent_id");
  CREATE INDEX "news_posts_blocks_image_block_path_idx" ON "news_posts_blocks_image_block" USING btree ("_path");
  CREATE INDEX "news_posts_blocks_image_block_image_idx" ON "news_posts_blocks_image_block" USING btree ("image_id");
  CREATE INDEX "news_posts_blocks_video_block_order_idx" ON "news_posts_blocks_video_block" USING btree ("_order");
  CREATE INDEX "news_posts_blocks_video_block_parent_id_idx" ON "news_posts_blocks_video_block" USING btree ("_parent_id");
  CREATE INDEX "news_posts_blocks_video_block_path_idx" ON "news_posts_blocks_video_block" USING btree ("_path");
  CREATE INDEX "news_posts_blocks_video_block_video_file_idx" ON "news_posts_blocks_video_block" USING btree ("video_file_id");
  CREATE INDEX "news_posts_blocks_embed_block_order_idx" ON "news_posts_blocks_embed_block" USING btree ("_order");
  CREATE INDEX "news_posts_blocks_embed_block_parent_id_idx" ON "news_posts_blocks_embed_block" USING btree ("_parent_id");
  CREATE INDEX "news_posts_blocks_embed_block_path_idx" ON "news_posts_blocks_embed_block" USING btree ("_path");

  -- Globals: hand-altered text columns back to Payload's varchar with field defaults.
  ALTER TABLE "news_page"
    ALTER COLUMN "announcement_hero_kicker" SET DATA TYPE varchar, ALTER COLUMN "announcement_hero_kicker" SET DEFAULT 'HIGH COMMAND DIRECTIVE // PRIORITY BEACON',
    ALTER COLUMN "announcement_hero_heading" SET DATA TYPE varchar, ALTER COLUMN "announcement_hero_heading" SET DEFAULT 'Official Announcements',
    ALTER COLUMN "announcement_hero_tagline" SET DATA TYPE varchar, ALTER COLUMN "announcement_hero_tagline" SET DEFAULT 'Official high-level decrees, org updates, and critical leadership directives.',
    ALTER COLUMN "announcement_hero_background_image" SET DATA TYPE varchar, ALTER COLUMN "announcement_hero_background_image" SET DEFAULT '/backgrounds/SC-4.5.0_20251229_131102_Hathor-orbital-laser_f.png',
    ALTER COLUMN "ops_hero_kicker" SET DATA TYPE varchar, ALTER COLUMN "ops_hero_kicker" SET DEFAULT 'COMBAT INTEL // STRIKE FORCE DISPATCHES',
    ALTER COLUMN "ops_hero_heading" SET DATA TYPE varchar, ALTER COLUMN "ops_hero_heading" SET DEFAULT 'Tactical Operations',
    ALTER COLUMN "ops_hero_tagline" SET DATA TYPE varchar, ALTER COLUMN "ops_hero_tagline" SET DEFAULT 'PvP strike reports, escort missions, sector defense strategies, and combat debriefs.',
    ALTER COLUMN "ops_hero_background_image" SET DATA TYPE varchar, ALTER COLUMN "ops_hero_background_image" SET DEFAULT '/backgrounds/SC-3.24_20241207_170744_Hornets-Over-Lake_f.png',
    ALTER COLUMN "fleet_hero_kicker" SET DATA TYPE varchar, ALTER COLUMN "fleet_hero_kicker" SET DEFAULT 'HANGAR REGISTRY // CAPITAL ASSET RECLASSIFICATION',
    ALTER COLUMN "fleet_hero_heading" SET DATA TYPE varchar, ALTER COLUMN "fleet_hero_heading" SET DEFAULT 'Fleet Updates',
    ALTER COLUMN "fleet_hero_tagline" SET DATA TYPE varchar, ALTER COLUMN "fleet_hero_tagline" SET DEFAULT 'New ship acquisitions, capital ship deployments, logistics routes, and fleet roster changes.',
    ALTER COLUMN "fleet_hero_background_image" SET DATA TYPE varchar, ALTER COLUMN "fleet_hero_background_image" SET DEFAULT '/backgrounds/SC-3.19_20230524_130313_Fleet-selfie_ILW2953_f.png',
    ALTER COLUMN "lore_hero_kicker" SET DATA TYPE varchar, ALTER COLUMN "lore_hero_kicker" SET DEFAULT 'ARCHIVAL RECORDS // CHRONICLES OF SECTOR 7',
    ALTER COLUMN "lore_hero_heading" SET DATA TYPE varchar, ALTER COLUMN "lore_hero_heading" SET DEFAULT 'Org Lore & Archives',
    ALTER COLUMN "lore_hero_tagline" SET DATA TYPE varchar, ALTER COLUMN "lore_hero_tagline" SET DEFAULT 'Deep space histories, squad origins, operational philosophies, and narrative chronicles.',
    ALTER COLUMN "lore_hero_background_image" SET DATA TYPE varchar, ALTER COLUMN "lore_hero_background_image" SET DEFAULT '/backgrounds/SC-4.0_20250102_160626_Fuego-night-sky_f.png',
    ALTER COLUMN "community_hero_kicker" SET DATA TYPE varchar, ALTER COLUMN "community_hero_kicker" SET DEFAULT 'CREW NETWORK // SOCIAL & MEMBER HIGHLIGHTS',
    ALTER COLUMN "community_hero_heading" SET DATA TYPE varchar, ALTER COLUMN "community_hero_heading" SET DEFAULT 'Community Dispatches',
    ALTER COLUMN "community_hero_tagline" SET DATA TYPE varchar, ALTER COLUMN "community_hero_tagline" SET DEFAULT 'Member spotlights, casual hangouts, community accomplishments, and event highlights.',
    ALTER COLUMN "community_hero_background_image" SET DATA TYPE varchar, ALTER COLUMN "community_hero_background_image" SET DEFAULT '/backgrounds/SC-3.22_20240110_133821_mT-flower-hill-sunset_f.png';
  ALTER TABLE "site_settings"
    ALTER COLUMN "seo_title" SET DATA TYPE varchar, ALTER COLUMN "seo_title" SET DEFAULT 'KHALAI MAKHLOOQ — Elite Star Citizen Organization',
    ALTER COLUMN "seo_description" SET DATA TYPE varchar, ALTER COLUMN "seo_description" SET DEFAULT 'Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination when the scene gets spicy.',
    ALTER COLUMN "seo_image_url" SET DATA TYPE varchar, ALTER COLUMN "seo_image_url" SET DEFAULT '/opengraph-image.jpg';

  -- Payload fields added since the dev push.
  ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;

  -- Leftovers: lock columns for collections with lockDocuments: false, an unused table and sequences, old functions.
  DELETE FROM "payload_locked_documents_rels" WHERE "announcements_id" IS NOT NULL OR "fleet_configs_id" IS NOT NULL OR "news_posts_id" IS NOT NULL OR "team_members_id" IS NOT NULL;
  ALTER TABLE "payload_locked_documents_rels"
    DROP COLUMN "announcements_id",
    DROP COLUMN "fleet_configs_id",
    DROP COLUMN "news_posts_id",
    DROP COLUMN "team_members_id";
  DROP TABLE "tokens";
  DROP SEQUENCE IF EXISTS "news_posts_blocks_text_block_id_seq", "news_posts_blocks_image_block_id_seq", "news_posts_blocks_video_block_id_seq", "news_posts_blocks_embed_block_id_seq";
  DROP POLICY IF EXISTS "Public read" ON "team_members";
  DROP FUNCTION IF EXISTS "public"."add_fleet_ceo"(uuid, text);
  DROP FUNCTION IF EXISTS "public"."get_fleet_ceo"(uuid, integer);
  DROP FUNCTION IF EXISTS "public"."is_admin"(text);
  DROP FUNCTION IF EXISTS "public"."update_fleet_configs_updated_at"();
  DROP FUNCTION IF EXISTS "public"."update_updated_at"();
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
    // One-way: it renumbers team member ids and drops data-free leftovers. Restore from a backup instead.
    throw new Error("reconcile_live_schema cannot be reverted");
}
