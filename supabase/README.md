# Supabase

Schema + RLS policies for rahul-dev. Applied via the Supabase CLI.

## First-time setup

```bash
# Install the Supabase CLI locally
npm install -D supabase

# Log in and link to the Supabase project
npx supabase login
npx supabase link --project-ref <your-project-ref>

# Push the initial migration
npx supabase db push
```

After push, create a single admin user in the Supabase dashboard (Auth →
Users → Add user) and put that email into `admin.email` in the app's
runtime config (`apps/web/src/app/app.config.ts`).

## What's in here

- `migrations/0001_init.sql` — all tables + RLS policies matching the
  blueprint §9 schema. Includes `projects`, `feed_items`,
  `contact_messages`, `page_views` (expanded), `visitor_salt`,
  `site_settings`.

## RLS summary

| Table | anon read | anon write | authenticated |
|---|---|---|---|
| projects | published only | — | all |
| feed_items | published only | — | all |
| contact_messages | — | INSERT only | all |
| page_views | — | INSERT only | SELECT |
| visitor_salt | — | — | SELECT only |
| site_settings | ✓ | — | all |

## Phase 11.1 TODO

- Supabase Edge Function that rotates `visitor_salt` daily via
  `cron.schedule`. The Phase 11 tracker uses a localStorage-based
  client salt until that's live.
- Edge Function + endpoint returning the current salt to the client-side
  tracker so visitor hashes become truly cross-session opaque.
