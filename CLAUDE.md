# CLAUDE.md

Website for the Khalai Makhlooq Star Citizen org (kmhq.org): fleet viewer, team roster, news and a Payload CMS admin.

Keep `CLAUDE.md`, `ARCHITECTURE.md` and `README.md` up to date: when a change affects what one of them describes, update it in the same change.

## References

Read these for further context or when a task needs them; they aren't loaded automatically.

- `ARCHITECTURE.md`: How rendering, caching, data and auth fit together. Read it before changing any of them.
- `README.md`: Human-facing docs. Read it for setup and deployment steps.
- `payload-reference/`: Stock Next.js + Payload scaffold. Compare against it when changing framework config (Next, Payload, TypeScript, ESLint). Never edit it or import from it.

## Commands

- Use pnpm.

## Code conventions

- Prefer built-in Tailwind utilities over arbitrary values when the visual difference is negligible.
- Cache data with `"use cache"` + `cacheLife` + `cacheTag`. Never use `unstable_cache` or route segment config; `export const dynamic` is rejected under Cache Components.
- Keep `try/catch` outside `"use cache"` functions so failures aren't cached.
- When adding a third-party domain for scripts, images, connect or frames, add it to the site or admin CSP in `next.config.mjs`.
- Render images with `next/image`. A remote image host must be in both `images.remotePatterns` in `next.config.mjs` and `OPTIMIZED_HOSTS` in `app/lib/media.ts`; pass `unoptimized={isUnoptimized(src)}` when the URL comes from the CMS or a user.
- `public/draco/` is the Draco decoder `FleetScene` loads at runtime. knip reports it as unused; keep it.

## Payload

- After changing collections, globals or admin components, run `pnpm generate:types` and `pnpm generate:importmap`.
- Don't edit `app/(payload)/`. It matches `payload-reference/app/(payload)/` (GraphQL routes included) apart from Prettier formatting. Only `importMap.js` differs; `pnpm generate:importmap` regenerates it.
- The Postgres adapter runs with `push: false`, so schema changes need a migration: `pnpm payload migrate:create`, then `pnpm payload migrate` locally. Production runs pending migrations on startup.
- The package must stay ESM (`"type": "module"`). The Payload CLI crashes without it.

## Deployment (Hostinger)

- Hostinger Node.js Web Apps deploys from GitHub and runs only `pnpm build` and `pnpm start`. Don't add a custom server.
- Hostinger's glibc can't load Next's native SWC binaries, so builds there fall back to WebAssembly SWC. Because of that, keep:
    - `--webpack` in `pnpm build` (Turbopack needs native SWC).
    - `next.config.mjs` as the config file (a `.ts` config fails to load under the fallback).
    - The server-side `concatenateModules: false` webpack override (Payload's `next/og` import needs it).

## Verification

There is no test suite. Before reporting work as done, run `pnpm build`. It catches type errors and Cache Components errors (uncached data outside `<Suspense>`, prerender failures), which only show up at build time.

## Commits and versioning

- Run `pnpm format` before committing so committed files are formatted.
- Before every push, bump the `version` in `package.json` and commit it on its own as `chore: version`. Bump the minor version if the commits being pushed include a `feat`; otherwise bump the patch version.
- Tag minor version bumps only, on the `chore: version` commit, with the version prefixed by `v` (e.g. `v1.1.0`). Don't tag patch bumps.

## Resources

External material outside the project's own files.

- `node_modules/next/dist/docs/`: Docs for the installed Next.js version, which may differ from your training data. Read the relevant guide before writing Next.js code, and heed its deprecation notices.
