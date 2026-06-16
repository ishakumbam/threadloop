import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Prisma 7 uses driver adapters. better-sqlite3 wants a filesystem path, so we
// strip the "file:" scheme from DATABASE_URL. Swap this adapter for PrismaPg
// (and the schema provider for postgresql) to move to Supabase/Postgres.
const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
