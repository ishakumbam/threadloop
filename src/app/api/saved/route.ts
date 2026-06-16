import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureUser, getCurrentUser } from "@/lib/session";

const bodySchema = z.object({ productId: z.string().min(1) });

// List the shopper's saved product ids.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ saved: [] });

  const rows = await prisma.savedItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return NextResponse.json({ saved: rows.map((r) => r.productId) });
}

// Add a product to the closet.
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  const user = await ensureUser();

  await prisma.savedItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    create: { userId: user.id, productId: parsed.data.productId },
    update: {},
  });

  return NextResponse.json({ ok: true, saved: true });
}

// Remove a product from the closet.
export async function DELETE(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: true, saved: false });

  await prisma.savedItem.deleteMany({
    where: { userId: user.id, productId: parsed.data.productId },
  });

  return NextResponse.json({ ok: true, saved: false });
}
