# CoHome

A platform that helps divorced, widowed, and unmarried adults (30+) find
platonic roommates based on lifestyle compatibility, interests, and location.
Explicitly not a dating site — every part of the copy, UX, and matching logic
reinforces friendship and shared living.

Launch region: Greater Vancouver, BC. The data model is city/region-agnostic
(cities and metro areas are rows, not code), so new regions are a data change.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4), package manager **pnpm**
- **Supabase** — Postgres (with row-level security throughout), Auth,
  Storage (profile photos), Realtime (chat + unread badges)
- **Gemini Flash-Lite** — automated photo moderation on upload (soft content
  gate, not identity verification)
- **Vitest** — unit tests for the compatibility scorer

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # then fill in the values below
pnpm run dev                       # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable (anon) key |
| `GEMINI_API_KEY` | Photo moderation (uploads fail closed without it) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; required for account deletion |

## Database

Schema lives in `supabase/migrations/` (idempotent seeds included: Greater
Vancouver cities, neighbourhoods, curated interest catalog). Apply with:

```bash
pnpm dlx supabase db push --db-url "<postgres-connection-string>"
```

Note: this project's direct database host is IPv6-only; use the session
pooler connection string (`aws-1-us-west-2.pooler.supabase.com:5432`).

`src/lib/supabase/database.types.ts` is hand-maintained to match the schema
(the CLI generator needs Docker). Update it alongside any migration.

## Architecture notes

- **Compatibility scoring** (`src/lib/matching/score.ts`): pure, unit-tested
  function; 60% lifestyle/house rules, 20% kids/custody, 20% interests
  (tiered: exact tag > same category > none). Computed at request time —
  revisit if the platform outgrows one metro area.
- **Safety is enforced in the database, not the UI**: blocking, mutual-only
  messaging, and interest privacy are all RLS policies or SECURITY DEFINER
  functions (`express_interest`, `is_blocked_between`). One-sided interest
  is never visible to the other person, in the API as well as the UI.
- **Route groups**: `(marketing)` public pages, `(auth)` login/signup,
  `(app)` authenticated (session-refresh + auth wall in `src/proxy.ts`,
  onboarding-completeness gate in `(app)/(main)/layout.tsx`). Onboarding
  steps double as the profile editor.
- **Photo uploads** go through `/api/photos/upload` (moderation before
  storage) — never directly from the browser to the bucket.

## Tests

```bash
pnpm test          # scorer unit tests
pnpm exec tsc --noEmit
pnpm run lint
```

## Not yet implemented

- Email delivery for notification preferences (stored, not sent — needs an
  email provider)
- Phone/ID verification badges (schema fields exist, always false in v1)
- Admin review dashboard for reports (reports are logged with status `open`)
