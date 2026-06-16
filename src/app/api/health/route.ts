import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Diagnostic endpoint: confirms which DB env var is present and whether the app
// can actually reach + read the database. Hit /api/health on the deployment.
export async function GET() {
  const envVarsPresent = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"].filter(
    (k) => Boolean(process.env[k]),
  );

  try {
    const [products, users] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
    ]);
    return NextResponse.json({ ok: true, envVarsPresent, products, users });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        envVarsPresent,
        error: e instanceof Error ? e.message : String(e),
        hint:
          envVarsPresent.length === 0
            ? "No DB connection string in the runtime env. Add a Postgres database in Vercel → Storage, then redeploy."
            : "Connected env var found but the query failed — tables may not exist yet (run schema push) or SSL/credentials are off.",
      },
      { status: 500 },
    );
  }
}
