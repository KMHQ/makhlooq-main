# Architecture

- **Rendering.** Next.js 16 App Router with Cache Components. Each `app/(app)/**/page.tsx` is a server component that loads data and passes it to a `*PageClient.tsx` client component. `app/(payload)/` holds Payload's admin and REST routes.
- **Caching.** Data functions are cached with `"use cache"` and tagged with `cacheTag`. Writes expire tags with `revalidateTag(tag, { expire: 0 })`, and Payload saves do the same through `hooks/revalidate.ts`. CMS pages call `connection()` first, so they render per request and the build never needs the database.
- **Data.** Payload is the only data store: a Postgres database (hosted on Supabase, used as plain Postgres via `DATABASE_URL`) described by `collections/` and `globals/`. Pages read it through `app/lib/payload/queries.ts`; the custom `app/api/` routes (team members, fleet configs and crew, the Discord sync, avatars) use the Local API through `getPayloadInstance()`, with access checks done by the routes themselves (`app/lib/adminAuth.ts`). The schema lives in Payload migrations under `migrations/`, which run when the production server starts (`prodMigrations`).
- **Uploads.** Payload upload collections (`media`, `avatars`) store files on local disk under `UPLOADS_DIR` (default: the project root) and serve them at `/api/<collection>/file/<name>`.
- **Auth.** Two separate systems:
    - **Discord OAuth** with an HMAC-signed `kmhq_admin_session` cookie guards the site's own admin pages (`app/lib/adminAuth.ts`). Super-admins come from `ADMIN_DISCORD_IDS`.
    - **Payload's `Users`** guard `/admin`.
