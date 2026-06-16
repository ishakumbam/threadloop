import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getAllProducts, profileToInput } from "@/lib/catalog";
import { recommend } from "@/lib/recommend";

// Rank the curated catalog for the current shopper's taste profile.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No profile yet" }, { status: 401 });
  }

  const profileRow = await prisma.tasteProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profileRow) {
    return NextResponse.json({ error: "No profile yet" }, { status: 401 });
  }

  const [products, savedRows] = await Promise.all([
    getAllProducts(),
    prisma.savedItem.findMany({
      where: { userId: user.id },
      select: { productId: true },
    }),
  ]);

  const profile = profileToInput(profileRow);
  const ranked = recommend(products, profile);
  const savedIds = new Set(savedRows.map((s) => s.productId));

  return NextResponse.json({
    results: ranked.map((p) => ({ ...p, saved: savedIds.has(p.id) })),
  });
}
