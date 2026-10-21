import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
   CREATE TYPE "public"."enum_news_posts_blocks_video_block_video_source" AS ENUM('upload', 'url');
  CREATE TYPE "public"."enum_news_posts_category" AS ENUM('announcement', 'ops', 'fleet', 'lore', 'community');
  CREATE TYPE "public"."enum_news_posts_author_source" AS ENUM('member', 'external');
  CREATE TYPE "public"."enum_announcements_severity" AS ENUM('info', 'warning', 'critical');
  CREATE TYPE "public"."enum_fleet_configs_fleet_type" AS ENUM('small', 'medium', 'large', 'sub_capital', 'capital');
  CREATE TYPE "public"."enum_team_members_flair_icon" AS ENUM('crown', 'shield', 'sword', 'users', 'zap', 'terminal', 'none');
  CREATE TYPE "public"."enum_team_members_category" AS ENUM('Field Marshal', 'General', 'Commander', 'Colonel', 'Major', 'Captain', 'Officer', 'Lieutenant', 'Sergeant', 'Corporal', 'Soldier', 'Citizen', 'Makhlooq');
  CREATE TYPE "public"."enum_team_members_sec_level" AS ENUM('R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('active', 'inactive');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
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
  
  CREATE TABLE "news_posts_blocks_text_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "news_posts_blocks_image_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"full_width" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "news_posts_blocks_video_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_source" "enum_news_posts_blocks_video_block_video_source" DEFAULT 'upload',
  	"video_file_id" integer,
  	"video_url" varchar,
  	"caption" varchar,
  	"autoplay" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "news_posts_blocks_embed_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "news_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"category" "enum_news_posts_category",
  	"cover_image_id" integer,
  	"author_source" "enum_news_posts_author_source" DEFAULT 'external',
  	"author_member_id" integer,
  	"author_external" varchar,
  	"body" jsonb,
  	"author_handle" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"message" varchar NOT NULL,
  	"severity" "enum_announcements_severity" DEFAULT 'info',
  	"active" boolean DEFAULT true,
  	"expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fleet_configs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"display_name" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"fleet_type" "enum_fleet_configs_fleet_type" DEFAULT 'medium',
  	"ceo_name" varchar,
  	"ceo_discord_uid" varchar,
  	"quantity" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"discord_uid" varchar NOT NULL,
  	"discord_tag" varchar,
  	"name" varchar NOT NULL,
  	"role" varchar DEFAULT 'KMHQ',
  	"flair_color" varchar DEFAULT '#10b981',
  	"flair_icon" "enum_team_members_flair_icon" DEFAULT 'zap',
  	"category" "enum_team_members_category" DEFAULT 'Makhlooq',
  	"sec_level" "enum_team_members_sec_level" DEFAULT 'R0',
  	"avatar_url" varchar,
  	"node_color" varchar DEFAULT '#10b981',
  	"bio" varchar,
  	"status" "enum_team_members_status" DEFAULT 'active',
  	"awards" jsonb DEFAULT '[]'::jsonb,
  	"is_approved" boolean DEFAULT false,
  	"is_admin" boolean DEFAULT false,
  	"joined_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_about_manifesto_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_page_about_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"copy" varchar
  );
  
  CREATE TABLE "home_page_about_signals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"signal" varchar
  );
  
  CREATE TABLE "home_page_showcase_headline_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar
  );
  
  CREATE TABLE "home_page_showcase_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "home_page_showcase_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"name" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "home_page_values_narratives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"subtitle" varchar,
  	"title1" varchar,
  	"title2" varchar,
  	"desc" varchar
  );
  
  CREATE TABLE "home_page_faq_headline_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_page_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_url" varchar,
  	"hero_heading1" varchar DEFAULT 'Join Khalai Makhlooq',
  	"hero_heading2" varchar DEFAULT 'Rule the Stars',
  	"hero_description" varchar DEFAULT 'Elite Star Citizen Org, laid-back scene',
  	"hero_cta_text" varchar DEFAULT 'Click Here to Join Discord',
  	"hero_cta_link" varchar DEFAULT 'https://discord.gg/kmhq',
  	"hero_subheading1_normal" varchar DEFAULT 'And, Welcome PvP',
  	"hero_subheading1_hover" varchar DEFAULT 'We Enjoy PvE',
  	"hero_subheading2_normal" varchar DEFAULT 'Also, Murder Hobos',
  	"hero_subheading2_hover" varchar DEFAULT 'Space Capitalists',
  	"hero_subheading3_normal" varchar DEFAULT 'Hide or Die',
  	"hero_subheading3_hover" varchar DEFAULT 'Deep Space Chilling',
  	"hero_background_video_id" integer,
  	"hero_poster_image_id" integer,
  	"hero_logo_image_id" integer,
  	"about_section_label" varchar DEFAULT 'Fleet Operations Scene',
  	"about_intro" varchar DEFAULT 'Khalai Makhlooq is no boring history lecture. It is crew, ships, signal, and pressure combined. Even space took notice.',
  	"about_status_badge" varchar DEFAULT 'KMHQ / Scene Active',
  	"about_visual_label" varchar DEFAULT 'Hangar posture',
  	"about_visual_heading" varchar DEFAULT 'Calm mind. Dangerous aim.',
  	"about_fleet_image_id" integer,
  	"showcase_section_label" varchar DEFAULT 'Operations Breakdown',
  	"showcase_overview_text" varchar DEFAULT 'Khalai Makhlooq covers every angle of the Stanton system. Whether it is moving high-value cargo through contested space, recovering downed ships in hostile territory, or locking down an orbital station with overwhelming firepower—KMHQ is equipped, trained, and ready to deploy.',
  	"showcase_metrics_panel_body" varchar DEFAULT 'Every division has a simple rule: move fast, see first, and leave the battlefield so clean people ask who the cleanup crew was.',
  	"showcase_pillars_heading" varchar DEFAULT 'Style under pressure.',
  	"showcase_pillars_subtext" varchar DEFAULT 'Fleet layout is simple: clear roles, wide space, and zero random button mashing. Just coordinated action.',
  	"faq_section_label" varchar DEFAULT 'Quick Q&A',
  	"faq_description" varchar DEFAULT 'Toss your confusion out the airlock. Ask the question, get the answer, then head back to the hangar for more fun.',
  	"faq_search_placeholder" varchar DEFAULT 'Search a question...',
  	"faq_no_results_text" varchar DEFAULT 'No matching answers found — try checking the spelling',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_nav_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar DEFAULT 'KHALAI MAKHLOOQ — Elite Star Citizen Organization',
  	"seo_description" varchar DEFAULT 'Khalai Makhlooq is a Star Citizen crew with big ships, chill energy, and serious coordination when the scene gets spicy.',
  	"seo_image_url" varchar DEFAULT '/opengraph-image.jpg',
  	"footer_org_name" varchar DEFAULT 'Khalai Makhlooq',
  	"footer_org_short_name" varchar DEFAULT 'KMHQ',
  	"footer_description" varchar DEFAULT 'A Star Citizen organization built around sharp coordination, capable crews, and a cinematic fleet presence.',
  	"footer_status_badge1" varchar DEFAULT 'Ready',
  	"footer_status_badge2" varchar DEFAULT 'Stay tuned',
  	"footer_nav_section_label" varchar DEFAULT 'Navigate',
  	"footer_comms_section_label" varchar DEFAULT 'Comms',
  	"footer_email_address" varchar DEFAULT 'info@khalai.makhlooq',
  	"footer_discord_link" varchar DEFAULT 'https://discord.gg/kmhq',
  	"footer_discord_link_text" varchar DEFAULT 'discord.gg/kmhq',
  	"footer_signal_log1" varchar DEFAULT 'System: calm',
  	"footer_signal_log2" varchar DEFAULT 'Hangar: open',
  	"footer_signal_log3" varchar DEFAULT 'Vibe: locked in',
  	"footer_copyright" varchar DEFAULT 'KHALAI MAKHLOOQ // SECTOR 7',
  	"discord_url" varchar DEFAULT 'https://discord.gg/kmhq',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "news_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar DEFAULT 'News & Intel | Khalai Makhlooq',
  	"seo_description" varchar DEFAULT 'Stay informed with the latest announcements, fleet dispatches, tactical operations, and lore updates from KMHQ command.',
  	"seo_image_url" varchar,
  	"hero_kicker" varchar DEFAULT 'KMHQ SIGNAL NETWORK // GLOBAL FEED',
  	"hero_heading" varchar DEFAULT 'News & Intel',
  	"hero_tagline" varchar DEFAULT 'Official tactical dispatches, organizational announcements, fleet developments, and operational reports straight from the bridge.',
  	"hero_background_image" varchar DEFAULT '/backgrounds/9a5b333b-3981-4d6a-a235-7e91fc1c6ff8.jpg',
  	"announcement_hero_kicker" varchar DEFAULT 'HIGH COMMAND DIRECTIVE // PRIORITY BEACON',
  	"announcement_hero_heading" varchar DEFAULT 'Official Announcements',
  	"announcement_hero_tagline" varchar DEFAULT 'Official high-level decrees, org updates, and critical leadership directives.',
  	"announcement_hero_background_image" varchar DEFAULT '/backgrounds/SC-4.5.0_20251229_131102_Hathor-orbital-laser_f.png',
  	"ops_hero_kicker" varchar DEFAULT 'COMBAT INTEL // STRIKE FORCE DISPATCHES',
  	"ops_hero_heading" varchar DEFAULT 'Tactical Operations',
  	"ops_hero_tagline" varchar DEFAULT 'PvP strike reports, escort missions, sector defense strategies, and combat debriefs.',
  	"ops_hero_background_image" varchar DEFAULT '/backgrounds/SC-3.24_20241207_170744_Hornets-Over-Lake_f.png',
  	"fleet_hero_kicker" varchar DEFAULT 'HANGAR REGISTRY // CAPITAL ASSET RECLASSIFICATION',
  	"fleet_hero_heading" varchar DEFAULT 'Fleet Updates',
  	"fleet_hero_tagline" varchar DEFAULT 'New ship acquisitions, capital ship deployments, logistics routes, and fleet roster changes.',
  	"fleet_hero_background_image" varchar DEFAULT '/backgrounds/SC-3.19_20230524_130313_Fleet-selfie_ILW2953_f.png',
  	"lore_hero_kicker" varchar DEFAULT 'ARCHIVAL RECORDS // CHRONICLES OF SECTOR 7',
  	"lore_hero_heading" varchar DEFAULT 'Org Lore & Archives',
  	"lore_hero_tagline" varchar DEFAULT 'Deep space histories, squad origins, operational philosophies, and narrative chronicles.',
  	"lore_hero_background_image" varchar DEFAULT '/backgrounds/SC-4.0_20250102_160626_Fuego-night-sky_f.png',
  	"community_hero_kicker" varchar DEFAULT 'CREW NETWORK // SOCIAL & MEMBER HIGHLIGHTS',
  	"community_hero_heading" varchar DEFAULT 'Community Dispatches',
  	"community_hero_tagline" varchar DEFAULT 'Member spotlights, casual hangouts, community accomplishments, and event highlights.',
  	"community_hero_background_image" varchar DEFAULT '/backgrounds/SC-3.22_20240110_133821_mT-flower-hill-sunset_f.png',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "fleet_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar DEFAULT 'Fleet | Khalai Makhlooq',
  	"seo_description" varchar DEFAULT 'Explore the KMHQ fleet.',
  	"seo_image_url" varchar,
  	"kicker" varchar DEFAULT 'KMHQ · Capital Assets',
  	"heading_line1" varchar DEFAULT 'Fleet',
  	"heading_line2" varchar DEFAULT 'Command',
  	"badge_text" varchar DEFAULT 'Live',
  	"ships_ready_label" varchar DEFAULT 'Ships Ready',
  	"total_value_label" varchar DEFAULT 'Total Flex',
  	"crew_seats_label" varchar DEFAULT 'Crew Seats',
  	"standard_kicker" varchar DEFAULT 'Admin Managed',
  	"standard_heading" varchar DEFAULT 'Standard Fleets',
  	"search_placeholder" varchar DEFAULT 'Search fleets...',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "team_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_title" varchar DEFAULT 'Team | Khalai Makhlooq',
  	"seo_description" varchar DEFAULT 'Meet the KMHQ team.',
  	"seo_image_url" varchar,
  	"kicker" varchar DEFAULT 'Crew Network',
  	"heading_line1" varchar DEFAULT 'Team',
  	"heading_line2" varchar DEFAULT 'Scene',
  	"description" varchar DEFAULT 'The roster wall, but not the boring kind. Pilots, officers, and crew — all here in clean cards with full style.',
  	"access_card_kicker" varchar DEFAULT 'Crew Access',
  	"access_card_heading" varchar DEFAULT 'Scene Live',
  	"access_card_badge" varchar DEFAULT 'Live',
  	"access_card_description" varchar DEFAULT 'Entry is through Discord, then you set up your profile. Admins get extra tools; otherwise, chill mode.',
  	"briefing_kicker" varchar DEFAULT 'Crew Matrix',
  	"briefing_heading_line1" varchar DEFAULT 'Crew',
  	"briefing_heading_line2" varchar DEFAULT 'Scene',
  	"briefing_description" varchar DEFAULT 'Simple vibe on the team page: find someone, check their role, feel the crew energy.',
  	"join_c_t_a_badge" varchar DEFAULT 'Recruitment Open',
  	"join_c_t_a_heading" varchar DEFAULT 'Join Khalai Makhlooq''s space crew',
  	"join_c_t_a_description" varchar DEFAULT 'Join the crew, see the ships, and grow your rank through organized action.',
  	"join_c_t_a_discord_link" varchar DEFAULT 'https://discord.gg/K7SfxPSwXk',
  	"join_c_t_a_discord_link_text" varchar DEFAULT 'Join on Discord',
  	"join_c_t_a_learn_more_text" varchar DEFAULT 'Learn More',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_text_block" ADD CONSTRAINT "news_posts_blocks_text_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_image_block" ADD CONSTRAINT "news_posts_blocks_image_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_image_block" ADD CONSTRAINT "news_posts_blocks_image_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_video_block" ADD CONSTRAINT "news_posts_blocks_video_block_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_video_block" ADD CONSTRAINT "news_posts_blocks_video_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts_blocks_embed_block" ADD CONSTRAINT "news_posts_blocks_embed_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_posts" ADD CONSTRAINT "news_posts_author_member_id_team_members_id_fk" FOREIGN KEY ("author_member_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_about_manifesto_lines" ADD CONSTRAINT "home_page_about_manifesto_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_about_principles" ADD CONSTRAINT "home_page_about_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_about_signals" ADD CONSTRAINT "home_page_about_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_showcase_headline_words" ADD CONSTRAINT "home_page_showcase_headline_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_showcase_metrics" ADD CONSTRAINT "home_page_showcase_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_showcase_pillars" ADD CONSTRAINT "home_page_showcase_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_values_narratives" ADD CONSTRAINT "home_page_values_narratives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_faq_headline_lines" ADD CONSTRAINT "home_page_faq_headline_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_faq_questions" ADD CONSTRAINT "home_page_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_background_video_id_media_id_fk" FOREIGN KEY ("hero_background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_poster_image_id_media_id_fk" FOREIGN KEY ("hero_poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_logo_image_id_media_id_fk" FOREIGN KEY ("hero_logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_about_fleet_image_id_media_id_fk" FOREIGN KEY ("about_fleet_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_nav_links" ADD CONSTRAINT "site_settings_nav_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
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
  CREATE INDEX "news_posts_cover_image_idx" ON "news_posts" USING btree ("cover_image_id");
  CREATE INDEX "news_posts_author_member_idx" ON "news_posts" USING btree ("author_member_id");
  CREATE INDEX "news_posts_updated_at_idx" ON "news_posts" USING btree ("updated_at");
  CREATE INDEX "news_posts_created_at_idx" ON "news_posts" USING btree ("created_at");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "fleet_configs_updated_at_idx" ON "fleet_configs" USING btree ("updated_at");
  CREATE INDEX "fleet_configs_created_at_idx" ON "fleet_configs" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_members_discord_uid_idx" ON "team_members" USING btree ("discord_uid");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_about_manifesto_lines_order_idx" ON "home_page_about_manifesto_lines" USING btree ("_order");
  CREATE INDEX "home_page_about_manifesto_lines_parent_id_idx" ON "home_page_about_manifesto_lines" USING btree ("_parent_id");
  CREATE INDEX "home_page_about_principles_order_idx" ON "home_page_about_principles" USING btree ("_order");
  CREATE INDEX "home_page_about_principles_parent_id_idx" ON "home_page_about_principles" USING btree ("_parent_id");
  CREATE INDEX "home_page_about_signals_order_idx" ON "home_page_about_signals" USING btree ("_order");
  CREATE INDEX "home_page_about_signals_parent_id_idx" ON "home_page_about_signals" USING btree ("_parent_id");
  CREATE INDEX "home_page_showcase_headline_words_order_idx" ON "home_page_showcase_headline_words" USING btree ("_order");
  CREATE INDEX "home_page_showcase_headline_words_parent_id_idx" ON "home_page_showcase_headline_words" USING btree ("_parent_id");
  CREATE INDEX "home_page_showcase_metrics_order_idx" ON "home_page_showcase_metrics" USING btree ("_order");
  CREATE INDEX "home_page_showcase_metrics_parent_id_idx" ON "home_page_showcase_metrics" USING btree ("_parent_id");
  CREATE INDEX "home_page_showcase_pillars_order_idx" ON "home_page_showcase_pillars" USING btree ("_order");
  CREATE INDEX "home_page_showcase_pillars_parent_id_idx" ON "home_page_showcase_pillars" USING btree ("_parent_id");
  CREATE INDEX "home_page_values_narratives_order_idx" ON "home_page_values_narratives" USING btree ("_order");
  CREATE INDEX "home_page_values_narratives_parent_id_idx" ON "home_page_values_narratives" USING btree ("_parent_id");
  CREATE INDEX "home_page_faq_headline_lines_order_idx" ON "home_page_faq_headline_lines" USING btree ("_order");
  CREATE INDEX "home_page_faq_headline_lines_parent_id_idx" ON "home_page_faq_headline_lines" USING btree ("_parent_id");
  CREATE INDEX "home_page_faq_questions_order_idx" ON "home_page_faq_questions" USING btree ("_order");
  CREATE INDEX "home_page_faq_questions_parent_id_idx" ON "home_page_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_hero_background_video_idx" ON "home_page" USING btree ("hero_background_video_id");
  CREATE INDEX "home_page_hero_hero_poster_image_idx" ON "home_page" USING btree ("hero_poster_image_id");
  CREATE INDEX "home_page_hero_hero_logo_image_idx" ON "home_page" USING btree ("hero_logo_image_id");
  CREATE INDEX "home_page_about_about_fleet_image_idx" ON "home_page" USING btree ("about_fleet_image_id");
  CREATE INDEX "site_settings_nav_links_order_idx" ON "site_settings_nav_links" USING btree ("_order");
  CREATE INDEX "site_settings_nav_links_parent_id_idx" ON "site_settings_nav_links" USING btree ("_parent_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "news_posts_blocks_text_block" CASCADE;
  DROP TABLE "news_posts_blocks_image_block" CASCADE;
  DROP TABLE "news_posts_blocks_video_block" CASCADE;
  DROP TABLE "news_posts_blocks_embed_block" CASCADE;
  DROP TABLE "news_posts" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "fleet_configs" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_about_manifesto_lines" CASCADE;
  DROP TABLE "home_page_about_principles" CASCADE;
  DROP TABLE "home_page_about_signals" CASCADE;
  DROP TABLE "home_page_showcase_headline_words" CASCADE;
  DROP TABLE "home_page_showcase_metrics" CASCADE;
  DROP TABLE "home_page_showcase_pillars" CASCADE;
  DROP TABLE "home_page_values_narratives" CASCADE;
  DROP TABLE "home_page_faq_headline_lines" CASCADE;
  DROP TABLE "home_page_faq_questions" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "site_settings_nav_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "news_page" CASCADE;
  DROP TABLE "fleet_page" CASCADE;
  DROP TABLE "team_page" CASCADE;
  DROP TYPE "public"."enum_news_posts_blocks_video_block_video_source";
  DROP TYPE "public"."enum_news_posts_category";
  DROP TYPE "public"."enum_news_posts_author_source";
  DROP TYPE "public"."enum_announcements_severity";
  DROP TYPE "public"."enum_fleet_configs_fleet_type";
  DROP TYPE "public"."enum_team_members_flair_icon";
  DROP TYPE "public"."enum_team_members_category";
  DROP TYPE "public"."enum_team_members_sec_level";
  DROP TYPE "public"."enum_team_members_status";`);
}
