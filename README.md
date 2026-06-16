# Threadloop

A clothing **discovery + recommendation** layer that monetizes through tracked
click-outs. Shoppers build a taste profile, we rank a curated catalog across
many retailers, and we redirect them to the store's own checkout. We never hold
inventory, payments, or returns — the affiliate model.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind 4** + **Framer Motion**
- **Prisma 7** + **SQLite** (via the better-sqlite3 driver adapter)
- Passwordless cookie session stub (swap for Clerk/Supabase Auth later)

## Architecture

```
ingestion (seed) → catalog → recommendation → click-out tracking → UI
```

| Piece            | Where                                                       |
| ---------------- | ----------------------------------------------------------- |
| Data model       | `prisma/schema.prisma`                                      |
| Curated catalog  | `prisma/seed.ts` (8 retailers, 26 products)                 |
| Style vocabulary | `src/lib/style.ts` (vibes, sizes, budgets — shared)         |
| Recommendation   | `src/lib/recommend.ts` (set-intersection scoring + reasons) |
| Session          | `src/lib/session.ts`                                         |
| API              | `src/app/api/{profile,recommendations,saved}/route.ts`      |
| Tracked redirect | `src/app/go/[productId]/route.ts` → logs `ClickOut`         |
| UI               | `src/components/*` + `src/app/{quiz,discover,closet}`       |

## Run (local)

Postgres-backed. Use any Postgres URL (Vercel Postgres / Neon / Supabase free tier),
or a local Postgres. Put it in `.env` as `DATABASE_URL` (see `.env.example`).

```bash
npm install
npx prisma db push            # create the schema in your Postgres
npm run seed                  # load the 43-product catalog (real brand images)
npm run dev -- -p 3100        # http://localhost:3100
```

## Deploy to Vercel

1. Import the repo in Vercel.
2. In the project's **Storage** tab, create a **Postgres** database — Vercel injects
   `DATABASE_URL` into the deployment automatically.
3. Push the schema + data into it once (from your machine, with that `DATABASE_URL`
   in `.env`): `npx prisma db push && npm run seed`.
4. Redeploy. The build runs `prisma generate && next build`; the running app connects
   to the same Postgres. Done.

> The build script generates the Prisma client, so a fresh clone builds cleanly.

## Daily updates, drops & notifications

`npm run refresh` simulates one day of the affiliate feed: rotates "New today"
arrivals, launches/expires limited-edition drops, applies price drops, and
writes notifications for every user whose taste profile matches. Schedule it to
run the "every day" behavior:

```bash
# crontab -e  → run at 6am daily
0 6 * * * cd /path/to/threadloop && npm run refresh >> refresh.log 2>&1
```

In production, replace the simulation in `scripts/daily-refresh.ts` with an
affiliate-feed ingest (Rakuten/AWIN/Impact) and run it on Vercel Cron / a worker.

## Accounts

Email + password auth (Node `scrypt`, no external service) in `src/lib/auth.ts`.
Signing up upgrades the current anonymous guest in place, so the quiz answers and
saved closet carry into the new account. Swap for Clerk/Supabase Auth later.

## Going to production

1. **DB:** change `provider` in `prisma/schema.prisma` to `postgresql`, point
   `DATABASE_URL` (in `prisma.config.ts`) at Supabase, and swap the adapter in
   `src/lib/prisma.ts` for `PrismaPg`.
2. **Auth:** replace `src/lib/session.ts` with Clerk or Supabase Auth.
3. **Real catalog + commissions:** replace seed data with affiliate feeds
   (Rakuten / AWIN / Impact / Skimlinks). Wrap the URL in `/go` with the
   network's tracking link — `ClickOut` rows are already the attribution signal.
