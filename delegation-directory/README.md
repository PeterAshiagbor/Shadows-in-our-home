# GEN UK Delegation Directory

A self-serve directory for the UK delegation to the Global Entrepreneurship
Congress. Built by Kickstart Global for GEN UK. The product is a collection
mechanism, not a rendering of a table: delegates claim their profile via a
personal link, add a photo and three lines, and consent to publication.

## Stack

- **Next.js 15** (App Router, plain JS) — deployed on Vercel
- **Supabase** (Kickstart account, project `gen-uk-delegation-directory`,
  `eu-west-2` London) — Postgres, Storage, Edge Functions

## Routes

| Route | Purpose |
|---|---|
| `/` | Card grid: photo (or monogram), name, role, organisation. Search across name + organisation, filter by category. Unclaimed delegates appear from day one. |
| `/d/[slug]` | Full profile: about, looking for at GEC, can help with, LinkedIn. |
| `/claim/[token]` | Personal claim link — validates token, edit form, photo upload, consent gate. |
| `/admin` | Completion dashboard (admin key required): stats, copy claim links, edit any profile, remove photos, unpublish, GDPR delete. |

## Architecture

- The **anon key** (public by design) can only read the `public_delegates`
  view. The view never includes `email` or `claim_token`, and withholds
  delegate-supplied content (`photo_path`, `summary`, `looking_for`,
  `can_help_with`) until `consent_public = true`. RLS denies all direct table
  access to anon.
- All **writes** go through two Supabase Edge Functions holding the service
  role key:
  - `claim` — validates the claim token, enforces the consent checkbox
    server-side, sanitises input, uploads photos (client resizes to max 800px
    JPEG first; 5MB cap).
  - `admin` — gated by an admin key checked against a SHA-256 hash in the
    locked `app_config` table. Supports edit, remove photo, unpublish, and
    same-day delete (row + photo) for GDPR requests.
- `cohort` column present from the first migration — the 2026 Doha delegation
  reuses this app without a rewrite (`gec-2025` is the prototype dataset).

## Privacy (non-negotiable, see handover §7)

- Consent checkbox gates every save; `consent_public` + `consent_at` are the
  GDPR paper trail.
- `X-Robots-Tag: noindex, nofollow` on every response, robots meta, and
  `robots.txt` disallow — link-visible, not search-visible.
- No delegate email addresses rendered anywhere public.
- Delete path: admin dashboard → Delete, or email the contact in the footer;
  removals same day.
- Outstanding before wide release: Matt's written sign-off on lawful basis.

## Migrations

SQL in `supabase/migrations/` (already applied to the project via MCP):
`0001_delegates.sql` (schema, RLS, view, bucket) and
`0002_seed_gec2025.sql` (46 delegates from the prepared CSV; source gaps kept
as nulls, categories provisional).

## Local dev

```bash
npm install
npm run dev
```

Supabase URL + anon key are baked into `lib/config.js` (browser-safe by
design) and overridable via `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
