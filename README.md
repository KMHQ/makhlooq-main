<div align="center">

# Khalai Makhlooq

### Official Star Citizen Organization Website

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-000?logo=payloadcms)](https://payloadcms.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/license-Private-red)](/)

**[kmhq.org](https://kmhq.org)** — Fleet management, team roster & member portal for the Khalai Makhlooq Star Citizen org.

</div>

---

## Features

- 🚀 **Fleet Browser** — Live 3D ship viewer powered by Three.js / React Three Fiber + Fleetyards API
- 👥 **Team Roster** — Discord-authenticated member directory with admin approval workflow
- 🛡️ **Admin Panel** — Full Payload CMS backend for content management
- 📰 **News & Updates** — Rich-text articles managed via Payload CMS
- 🎮 **Discord OAuth** — Login with Discord; guild membership verification via Bot API
- ✨ **Cinematic UI** — GSAP animations, PixiJS parallax, CSS glassmorphism

---

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)                         |
| **UI**             | React 19, Tailwind CSS v3, shadcn/ui            |
| **3D / Animation** | Three.js, React Three Fiber, Drei, GSAP, PixiJS |
| **CMS**            | Payload CMS 3 (Postgres adapter)                |
| **Database**       | Supabase (PostgreSQL)                           |
| **Auth**           | Discord OAuth2 + Bot API guild verification     |
| **Hosting**        | Hostinger Node.js Web Apps                      |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Postgres enabled
- A [Discord Application](https://discord.com/developers/applications) with OAuth2 configured

### 1. Clone & Install

```bash
git clone https://github.com/your-org/makhlooq.git
cd makhlooq
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                        | Description                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `DATABASE_URL`                  | Supabase Postgres connection URI (URL-encode special chars in password)        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase `service_role` secret key                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _(Optional)_ Supabase `anon` key, used only without the service role key       |
| `DISCORD_CLIENT_ID`             | Discord App OAuth2 Client ID                                                   |
| `DISCORD_CLIENT_SECRET`         | Discord App OAuth2 Client Secret                                               |
| `DISCORD_BOT_TOKEN`             | Discord Bot token (for guild membership checks)                                |
| `DISCORD_GUILD_ID`              | Your Discord server (guild) ID                                                 |
| `ADMIN_DISCORD_IDS`             | Comma-separated Discord User IDs with super-admin access                       |
| `NEXT_PUBLIC_SITE_URL`          | Public site URL, e.g. `https://kmhq.org`                                       |
| `NEXT_PUBLIC_SERVER_URL`        | _(Optional)_ Base URL for Payload live preview, defaults to `https://kmhq.org` |
| `ADMIN_SESSION_SECRET`          | _(Optional)_ Admin cookie secret, falls back to `DISCORD_CLIENT_SECRET`        |
| `PAYLOAD_SECRET`                | Secret for Payload CMS JWT signing                                             |
| `FLEETYARDS_FLEET_SLUGS`        | _(Optional)_ Comma-separated FleetYards fleet slugs to show without a DB row   |

> [!IMPORTANT]
> `DATABASE_URL` must have special characters in the password **percent-encoded**.
> Example: `!` → `%21`, `)` → `%29`, `@` → `%40`
> Get the pre-encoded URI from: **Supabase → Settings → Database → Connection string → URI tab**

### 3. Discord OAuth Redirect URIs

In your [Discord Developer Portal](https://discord.com/developers/applications), add these **redirect URIs**:

```
http://localhost:3000/api/auth/discord/callback   # development
https://kmhq.org/api/auth/discord/callback        # production
```

### 4. Run Locally

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).
The Payload admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Project Structure

```
makhlooq/
├── app/                        # Next.js App Router
│   ├── (app)/                  # Public-facing pages
│   ├── (payload)/              # Payload CMS admin routes
│   ├── api/                    # API routes
│   │   ├── auth/discord/       # Discord OAuth login & callback
│   │   ├── fleetyards/         # Fleetyards API proxy (ships & models)
│   │   └── team-members/       # Team member CRUD endpoints
│   ├── components/             # React components
│   │   ├── fleet/              # 3D fleet viewer (Three.js / R3F)
│   │   ├── team/               # Member roster & admin panel
│   │   └── admin/              # News editor
│   └── lib/                    # Server utilities (auth, Discord, Supabase, Payload queries)
├── collections/                # Payload CMS collections
├── globals/                    # Payload CMS globals
├── hooks/                      # Payload hooks (cache revalidation)
├── types/                      # Shared TypeScript types
├── public/                     # Static assets (images, fonts)
├── scripts/                    # Dev scripts
├── supabase/                   # Database schema & migrations
├── payload.config.ts           # Payload CMS configuration
└── next.config.ts              # Next.js configuration
```

---

## Deployment (Hostinger)

The site runs on Hostinger's Node.js Web Apps hosting, which builds and starts the app with Next.js directly.

1. In **hPanel → Websites → Add website → Node.js Apps**, import the GitHub repository and pick the `main` branch.
2. Use these build settings:
    - **Framework:** Next.js
    - **Node.js version:** 22 or later
    - **Install command:** `pnpm install`
    - **Build command:** `pnpm build`
    - **Start command:** `pnpm start`
3. Set all variables from the [table above](#2-environment-variables) under **Environment variables** before the first build, since `NEXT_PUBLIC_*` values are inlined at build time.
4. Deploy. Pushes to `main` can redeploy from the same screen.

---

## Database

The `supabase/` directory contains the full schema:

- **`schema.sql`** — baseline table definitions (`team_members`, etc.)
- **`migrations/`** — incremental migration files

To apply the schema to a fresh Supabase project, run `schema.sql` in the **Supabase SQL Editor**.

---

## Contributing

This is a private organization project. Contact an admin via Discord to request access.

---

<div align="center">
Made with ☕ by the Khalai Makhlooq command team
</div>
