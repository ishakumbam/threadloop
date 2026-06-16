import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Tracked click-out. Logs the redirect (the monetization signal) and forwards
// the shopper to the retailer. This is where an affiliate-link wrapper would
// go once we're approved on a network.
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ productId: string }> },
) {
  const { productId } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { externalUrl: true },
  });

  if (!product) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  const user = await getCurrentUser();
  const ref = request.nextUrl.searchParams.get("ref") ?? undefined;

  // Fire-and-forget logging shouldn't block the redirect on failure.
  await prisma.clickOut
    .create({ data: { productId, userId: user?.id ?? null, ref } })
    .catch(() => {});

  return NextResponse.redirect(product.externalUrl);
}
