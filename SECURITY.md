# Security Policy

## Supported Versions

The following versions of the **Khalai Makhlooq (KHLA) Command Center** are currently receiving security updates. Only actively maintained branches will receive patches for reported vulnerabilities.

| Version             | Supported                                 |
| ------------------- | ----------------------------------------- |
| 1.x (main)          | ✅ Active — receives all security patches |
| < 1.0 (pre-release) | ❌ No longer supported                    |

> **Note:** This project follows a rolling-release model on the `main` branch. We recommend always running the latest commit from `main` to stay up to date with security fixes.

---

## Reporting a Vulnerability

We take the security of the KHLA Command Center seriously. If you discover a vulnerability — whether in the web application, admin panel, API routes, or infrastructure — please report it **privately and responsibly**.

### How to Report

**Do not open a public GitHub issue for security vulnerabilities.**

Please report vulnerabilities through one of the following channels:

- **GitHub Private Security Advisory** _(preferred)_: Use the [Security tab](https://github.com/Looka-info/makhlooq-main/security/advisories/new) in this repository to submit a private advisory.
- **Email**: Send a detailed report to the maintainer via the contact listed in the GitHub profile at [github.com/Looka-info](https://github.com/Looka-info).

### What to Include in Your Report

To help us triage and resolve the issue as quickly as possible, please include:

- A clear description of the vulnerability and its potential impact
- The affected component (e.g., admin panel, Supabase API route, Discord OAuth flow, environment variable handling)
- Step-by-step reproduction instructions
- Any proof-of-concept code or screenshots (if applicable)
- Your suggested severity level (Critical / High / Medium / Low)

### Response Timeline

| Stage                                  | Timeframe                                                        |
| -------------------------------------- | ---------------------------------------------------------------- |
| Initial acknowledgement of your report | Within **48 hours**                                              |
| Triage and severity assessment         | Within **5 business days**                                       |
| Status update on fix progress          | Every **7 days** until resolved                                  |
| Patch released (if accepted)           | Within **30 days** for Critical/High; **60 days** for Medium/Low |

### What to Expect

- If your report is **accepted**: You will be kept informed throughout the remediation process. We will credit you in the fix commit or release notes (unless you prefer to remain anonymous).
- If your report is **declined**: We will explain clearly why the reported behaviour is not considered a vulnerability in this context.
- We do **not** offer a bug bounty at this time, but we genuinely appreciate responsible disclosure and will acknowledge contributions publicly.

---

## Scope

The following are considered **in scope** for security reports:

- Authentication bypass or privilege escalation in the Supabase Auth / Discord OAuth flow
- Unauthorized access to the admin panel or CMS routes (`/admin/*`)
- Exposed or leaked secrets (API keys, bot tokens, service role keys) in source code or build artifacts
- SQL injection or data exposure via Supabase/PostgreSQL queries
- Insecure serverless API routes (`/api/*`) that allow unauthenticated data mutation
- Cross-site scripting (XSS) or cross-site request forgery (CSRF) vulnerabilities
- Insecure handling of file uploads to Supabase storage
- Vulnerabilities in the Discord bot's command handling or permission checks

The following are considered **out of scope**:

- Vulnerabilities in third-party services (Supabase, Discord, FleetYards API, StarCitizen-API.com) — report those to the respective vendors
- Rate-limiting or DDoS resilience
- Issues requiring physical access to a device
- Social engineering attacks

---

## Security Best Practices for Contributors

If you are contributing to this project, please follow these guidelines:

- **Never commit secrets.** All sensitive values (`SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_BOT_TOKEN`, `SC_API_KEY`, etc.) must be stored in `.env.local` only — this file is listed in `.gitignore` and must never be committed.
- **Use the Supabase anon key on the client.** The service role key must only be used server-side in protected API routes.
- **Validate all admin routes server-side.** Always verify Discord OAuth session and `ADMIN_DISCORD_IDS` membership before executing any privileged operation.
- **Sanitize user input.** Any data from external APIs (StarCitizen-API, FleetYards) or user-submitted content (news posts, fleet slugs) should be validated and sanitized before being written to the database.
- **Keep dependencies up to date.** Run `npm audit` regularly and address any high or critical advisories before opening a pull request.

---

_Khalai Makhlooq Security Team — See You In The 'Verse._
