# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Website for the Khalai Makhlooq Star Citizen org (kmhq.org): fleet viewer, team roster, news, and a Payload CMS admin.

## Commands

Use pnpm.

- `pnpm dev`: dev server (Turbopack). The site is at `localhost:3000` and Payload admin at `/admin`.
- `pnpm build`: production build; type errors fail it. `pnpm start` serves it.
- `pnpm typecheck`, `pnpm lint`, `pnpm format`, `pnpm format:check`.
- `pnpm generate:types` (writes `payload-types.ts`) and `pnpm generate:importmap` after changing Payload collections, globals or admin components.
- `pnpm generate:db-types` regenerates `types/supabase.ts` from the live database (needs `DATABASE_URL` and the globally installed `supabase` CLI). The committed file is hand-written from `supabase/migrations/` until it's run.

There is no test suite. The package is ESM (`"type": "module"`), which the Payload CLI needs.

`payload-reference/` is a gitignored create-next-app + create-payload-app scaffold, kept as a reference for stock config; it's excluded from tsc, ESLint and Prettier.

## Architecture

- **Next.js 16 App Router, strict TypeScript, Cache Components.** `app/(app)/` is the public site: each `page.tsx` is a server component that loads data and passes it to a `*PageClient.tsx` client component. `app/(payload)/` is Payload's generated admin and REST routes; only `importMap.js` is regenerated.
- **Caching.** `cacheComponents` is on: data is cached with `"use cache"` + `cacheLife` + `cacheTag`, never `unstable_cache` or route segment config (`export const dynamic` etc. is rejected). Tags: `global:<slug>` and `news-posts` (Payload, `app/lib/payload/queries.ts`), `team-members`, `fleet-configs`, `fleetyards`, `discord`. Writes call `revalidateTag(tag, { expire: 0 })`; Payload saves do the same through `hooks/revalidate.ts`. Keep `try/catch` outside `"use cache"` functions so failures aren't cached. CMS pages call `connection()` first, so the build never needs database access.
- **Two data paths over one Supabase Postgres database:**
    - **Payload CMS** (`payload.config.ts`, collections in `collections/`, globals in `globals/`) holds editorial content: news, page globals, site settings. Server code uses `app/lib/payload/queries.ts` (cached) or `getPayloadInstance()`. The adapter runs with `push: false`, so schema changes need a Payload migration.
    - **Direct Supabase** (`app/lib/supabase.ts`, service-role key, server only) backs the custom API routes in `app/api/`: team members, fleet configs and members, the Discord sync, avatars. Row types come from `types/db.ts`. Tables are defined in `supabase/schema.sql` and `supabase/migrations/`, applied by hand.
- **Auth.** Discord OAuth (`app/api/auth/discord/*`) with guild checks via the Bot API (`app/lib/discord.ts`). `app/lib/adminAuth.ts` issues an HMAC-signed `kmhq_admin_session` cookie and provides `requireFleetAdmin`. Super-admins come from `ADMIN_DISCORD_IDS`. This is separate from Payload's `Users` auth for `/admin`.
- **External APIs.** `app/api/fleetyards/*` proxies FleetYards for ship data and 3D models (types in `types/fleetyards.ts`, mapping in `app/components/fleet/ships.ts`). `FleetScene` loads Draco GLBs with the decoder in `public/draco/`.
- **Shared modules.** Team constants and helpers (ranks, flair icons, awards) live in `app/components/team/teamConfig.ts`; news post parsing and formatting in `app/lib/newsPosts.ts`.
- **Imports.** `@/*` maps to the repo root (`@/app/lib/...`, `@/app/components/...`, `@/types/...`); `@payload-config` maps to `payload.config.ts`.
- **CSP.** `next.config.ts` defines the Content-Security-Policy (site and `/admin`). A new third-party domain for scripts, images, connect or frames has to be added there.

## Deployment

Hostinger Node.js Web Apps, deployed from GitHub; Hostinger runs `pnpm build` and `pnpm start`. The steps are in the README's "Deployment" section, and environment variables are listed in `.env.example`.
