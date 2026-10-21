import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
   CREATE TABLE "fleet_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fleet_config_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar DEFAULT 'Member',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "avatars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"discord_uid" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "fleet_members" ADD CONSTRAINT "fleet_members_fleet_config_id_fleet_configs_id_fk" FOREIGN KEY ("fleet_config_id") REFERENCES "public"."fleet_configs"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "fleet_members_fleet_config_idx" ON "fleet_members" USING btree ("fleet_config_id");
  CREATE INDEX "fleet_members_updated_at_idx" ON "fleet_members" USING btree ("updated_at");
  CREATE INDEX "fleet_members_created_at_idx" ON "fleet_members" USING btree ("created_at");
  CREATE INDEX "avatars_discord_uid_idx" ON "avatars" USING btree ("discord_uid");
  CREATE INDEX "avatars_updated_at_idx" ON "avatars" USING btree ("updated_at");
  CREATE INDEX "avatars_created_at_idx" ON "avatars" USING btree ("created_at");
  CREATE UNIQUE INDEX "avatars_filename_idx" ON "avatars" USING btree ("filename");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
   DROP TABLE "fleet_members" CASCADE;
  DROP TABLE "avatars" CASCADE;`);
}
