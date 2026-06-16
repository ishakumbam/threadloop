import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getProductsByIds } from "@/lib/catalog";
import { ClosetList } from "@/components/ClosetList";
import type { CardProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ClosetPage() {
  const user = await getCurrentUser();

  let products: CardProduct[] = [];
  if (user) {
    const saved = await prisma.savedItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { productId: true },
    });
    const dtos = await getProductsByIds(saved.map((s) => s.productId));
    // Preserve save order (most recent first).
    const order = new Map(saved.map((s, i) => [s.productId, i]));
    products = dtos
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .map((p) => ({ ...p, saved: true }));
  }

  return <ClosetList initial={products} />;
}
