# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Website for the Khalai Makhlooq Star Citizen org (kmhq.org): fleet viewer, team roster, news, and a Payload CMS admin.

## Commands

- `npm run dev`: dev server with Turbopack. The site is at `localhost:3000` and Payload admin at `/admin`.
- `npm run build`: production build. `postbuild` runs `scripts/create-static-link.js`, which links `.next/static` to `_next/static` for Hostinger/LiteSpeed.
- `npm run lint`, `npm run format`, `npm run format:check`: ESLint and Prettier.

There is no test suite. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so a passing build doesn't mean the types check.

The repo has both `package-lock.json` and `pnpm-lock.yaml`. Installed Next.js is 15.x, even though the README says 16.

## Architecture

- **Next.js App Router with two route groups.** `app/(app)/` holds the public site. Its `page.jsx` files are server components that fetch data and pass it to `*PageClient.jsx` client components. `app/(payload)/` is Payload CMS's generated admin and REST/GraphQL routes; leave it alone apart from `importMap.js` regeneration.
- **Two data paths over one Supabase Postgres database:**
  - **Payload CMS** (`payload.config.ts`, plus collections and globals in `src/payload/`) manages editorial content: news, page globals, and site settings. Server code gets it through `getPayloadInstance()` in `lib/payload/index.ts`. The adapter runs with `push: false`, so schema changes are not applied automatically. Ad-hoc fix-up scripts live in `scripts/`.
  - **Direct Supabase** (`@supabase/supabase-js` with the service-role key) handles most custom API routes in `app/api/`: team members, fleet configs and members, and the Discord sync. Their tables are defined in `supabase/schema.sql` and `supabase/migrations/`, which are applied by hand in the Supabase SQL editor.
- **Auth.** Discord OAuth (`app/api/auth/discord/*`) and guild-membership checks through the Bot API (`lib/discord.js`). `lib/adminAuth.js` issues an HMAC-signed `kmhq_admin_session` cookie and provides guards such as `requireFleetAdmin`. Super-admins come from `ADMIN_DISCORD_IDS`. This is separate from Payload's own `Users` auth used for `/admin`.
- **Caching.** `lib/redis.js` (`getOrSetCache` / `invalidateCache`) caches API responses. Payload hooks in `src/payload/hooks/revalidate.ts` call `revalidatePath` on content changes.
- **External APIs.** `app/api/fleetyards/*` proxies the Fleetyards API for ship data and 3D models. The fleet 3D scene (`src/components/fleet/FleetScene.jsx`) loads Draco-compressed GLBs using the decoder in `public/draco/`.
- **Imports.** `@/*` maps to `src/*`. Root-level `lib/` holds server utilities and is imported with relative paths.
- **CSP.** `next.config.mjs` defines a strict Content-Security-Policy. A new third-party domain for scripts, images, connect or frames has to be added there, or the browser blocks it.

## Deployment

Hostinger Node.js behind LiteSpeed, running the custom `server.js`. You build locally and upload a zip. The steps are in the README's "Deployment" section, and environment variables are listed in `.env.example`.
