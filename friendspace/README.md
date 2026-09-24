# PlaceholderApp (temporary name — swap once you've settled on one)

A shared home for your friend group's life: photo dumps, colour-hunting
challenges, uni-routine trends, meetup/videocall scheduling, and a retro
digital album — with real Google login and a real database.

## Stack (and why)

| Piece | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | One codebase, deploys free on Vercel, huge ecosystem |
| Auth | Supabase Auth (Google OAuth) | Real Google login in ~10 minutes, no separate auth server |
| Database | Supabase Postgres | Real SQL database, generous free tier, works great for a friend-group scale app |
| File storage | Supabase Storage | Photo/video uploads live next to your DB, served via CDN URLs |
| Hosting | Vercel | Free, connects straight to a GitHub repo, auto-deploys on push |

You don't need to run your own server. Supabase *is* your backend
(database + auth + file storage + row-level security). Next.js is only
the frontend talking to it.

## 1. One-time setup

1. **Create a Supabase project** at supabase.com (free tier is enough to start).
2. In Supabase → Authentication → Providers, enable **Google**, and follow
   their linked guide to create a Google OAuth Client ID/Secret in Google
   Cloud Console. Add your Vercel URL (and `http://localhost:3000` for dev)
   as an authorized redirect URI.
3. In Supabase → SQL Editor, run `supabase/schema.sql` from this project.
   It creates every table this app needs.
4. In Supabase → Storage, create a public bucket named `photos`.
5. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL
   and anon key (Project Settings → API).

## 2. Run it locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000, click "Continue with Google", and you should
land on the home feed.

## 3. Deploy

1. Push this folder to a new GitHub repo.
2. Import it on vercel.com → New Project.
3. Add the same environment variables from `.env.local` in Vercel's
   project settings.
4. Deploy. Add the resulting URL back into Supabase's Google redirect URIs.

## What's built vs. what's scaffolded

This starter gets the hard infrastructure working end-to-end (login,
database, storage, protected routes) and gives every feature a real page
and table, with basic working versions of the core loop:

- ✅ Google login, session handling, profiles
- ✅ Upload a photo into an album
- ✅ Retro digital album view (flip-through, film-strip style)
- ✅ Weekly/Monthly photo dumps (create + view)
- ✅ Colour-hunting challenge (create + submit + gallery)
- ✅ Uni-routine "trend" template (create + submit + gallery)
- ✅ Meetup & video-call scheduling with RSVP
- 🔲 Comments/reactions (table exists in schema, UI not built yet)
- 🔲 Notifications
- 🔲 Real visual design pass — this uses a simple placeholder look on
  purpose, so we don't lock in a style before your logo is ready

## Suggested build order from here

1. Drop in your logo (favicon + navbar) once you have it — happy to do a
   full visual design pass around it.
2. Wire up comments/reactions (schema's ready).
3. Add push/email notifications for new dumps, challenges, and meetups
   (Supabase has a free "Edge Functions + Resend" pattern for this).
4. Add a "TikTok trend" video upload (same Storage bucket, just accept
   video mimetypes).

## Database schema

See `supabase/schema.sql`. Quick map of tables → features:

- `profiles` — one row per user, extends Supabase's built-in auth
- `albums`, `photos` — the retro digital album
- `dumps`, `dump_photos` — weekly/monthly photo dumps
- `challenges`, `challenge_submissions` — colour-hunting (and future) challenges
- `trends`, `trend_entries` — "uni routine" style trend templates
- `meetups`, `meetup_rsvps` — meet-up and video-call planning
- `comments`, `reactions` — generic, attach to any of the above (schema only)
