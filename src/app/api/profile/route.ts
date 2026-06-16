import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUser, getCurrentUser } from "@/lib/session";
import { profileSchema } from "@/lib/validation";
import { profileToInput } from "@/lib/catalog";

// Return the current shopper's taste profile (or null if they haven't taken
// the quiz yet).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ profile: null });

  const profile = await prisma.tasteProfile.findUnique({
    where: { userId: user.id },
  });
  return NextResponse.json({
    profile: profile ? profileToInput(profile) : null,
  });
}

// Save (create or update) the taste profile. Lazily creates an anonymous user.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await ensureUser();
    const data = parsed.data;

    await prisma.tasteProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: { ...data },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Surface the real reason (usually a DB/connection issue) instead of a generic 500.
    console.error("profile save failed:", e);
    return NextResponse.json(
      { error: "Database error saving profile", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
