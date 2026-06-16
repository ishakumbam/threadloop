// Runs during the Vercel build (before `next build`). If a Postgres URL is
// present, it creates/updates the schema and seeds the catalog on first deploy.
// Everything is wrapped so a setup hiccup never fails the build — diagnose via
// the /api/health route instead.
import { execSync } from "node:child_process";

// Schema changes (db push) need the DIRECT (non-pooling) connection — a pooled
// pgbouncer URL breaks DDL. Prefer the unpooled var when present.
const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!url) {
  console.log("[setup] No Postgres URL in build env — skipping db push/seed.");
  process.exit(0);
}

// Prisma CLI + seed read DATABASE_URL specifically.
process.env.DATABASE_URL = url;
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

try {
  console.log("[setup] prisma db push…");
  run("npx prisma db push --skip-generate --accept-data-loss");
} catch (e) {
  console.error("[setup] db push failed (continuing build):", e?.message ?? e);
}

try {
  console.log("[setup] seeding catalog if empty…");
  process.env.SEED_IF_EMPTY = "1";
  run("npx tsx prisma/seed.ts");
} catch (e) {
  console.error("[setup] seed failed (continuing build):", e?.message ?? e);
}
