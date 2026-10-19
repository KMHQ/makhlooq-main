# Architecture

- **Rendering.** Next.js 16 App Router with Cache Components. Each `app/(app)/**/page.tsx` is a server component that loads data and passes it to a `*PageClient.tsx` client component. `app/(payload)/` holds Payload's admin and REST routes.
- **Caching.** Data functions are cached with `"use cache"` and tagged with `cacheTag`. Writes expire tags with `revalidateTag(tag, { expire: 0 })`, and Payload saves do the same through `hooks/revalidate.ts`. CMS pages call `connection()` first, so they render per request and the build never needs the database.
- **Data.** One Supabase Postgres database with two access paths:
    - **Payload** (`collections/`, `globals/`) holds editorial content: news, page globals and site settings. Server code reads it through `app/lib/payload/queries.ts`.
    - **Supabase** (`app/lib/supabase.ts`, service-role key, server only) backs the custom `app/api/` routes: team members, fleet configs and members, the Discord sync and avatars. Its tables are in `supabase/migrations/`, applied by hand.
- **Auth.** Two separate systems:
    - **Discord OAuth** with an HMAC-signed `kmhq_admin_session` cookie guards the site's own admin pages (`app/lib/adminAuth.ts`). Super-admins come from `ADMIN_DISCORD_IDS`.
    - **Payload's `Users`** guard `/admin`.
