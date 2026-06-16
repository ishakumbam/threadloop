import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Postgres connection string. Locally set DATABASE_URL in .env; on Vercel the
// Postgres integration injects DATABASE_URL / POSTGRES_URL automatically.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL;

// Cloud Postgres (Vercel/Neon/Supabase) needs TLS; local Postgres usually doesn't.
const remote = Boolean(connectionString) && !/localhost|127\.0\.0\.1/.test(connectionString!);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      ...(remote ? { ssl: { rejectUnauthorized: false } } : {}),
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
