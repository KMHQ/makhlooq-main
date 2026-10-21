import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "seo_image_url" SET DEFAULT '/logo.png';
   UPDATE "site_settings" SET "seo_image_url" = '/logo.png' WHERE "seo_image_url" = '/opengraph-image.jpg';`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "seo_image_url" SET DEFAULT '/opengraph-image.jpg';
   UPDATE "site_settings" SET "seo_image_url" = '/opengraph-image.jpg' WHERE "seo_image_url" = '/logo.png';`);
}
