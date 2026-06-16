import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/style";

// What the UI and recommender consume. JSON columns are coerced to string[].
export type ProductDTO = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  gradient: string;
  vibes: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  externalUrl: string;
  retailer: { name: string; brandColor: string };
  isLimited: boolean;
  stock: number | null;
  previousPrice: number | null;
  arrivedAt: string; // ISO; lets the UI flag "New today"
  dropEndsAt: string | null; // ISO countdown end for limited drops
};

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

type RawProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  gradient: string;
  vibes: unknown;
  colors: unknown;
  sizes: unknown;
  tags: unknown;
  externalUrl: string;
  retailer: { name: string; brandColor: string };
  isLimited: boolean;
  stock: number | null;
  previousPrice: number | null;
  arrivedAt: Date;
  dropEndsAt: Date | null;
};

function toDTO(p: RawProduct): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    category: p.category,
    price: p.price,
    currency: p.currency,
    imageUrl: p.imageUrl,
    gradient: p.gradient,
    vibes: arr(p.vibes),
    colors: arr(p.colors),
    sizes: arr(p.sizes),
    tags: arr(p.tags),
    externalUrl: p.externalUrl,
    retailer: p.retailer,
    isLimited: p.isLimited,
    stock: p.stock,
    previousPrice: p.previousPrice,
    arrivedAt: p.arrivedAt.toISOString(),
    dropEndsAt: p.dropEndsAt ? p.dropEndsAt.toISOString() : null,
  };
}

// Was the product added in the last 24h? Drives the "New today" badge/section.
export function isNewToday(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;
}

const include = { retailer: { select: { name: true, brandColor: true } } };

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include,
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => toDTO(r as unknown as RawProduct));
}

export async function getProductsByIds(ids: string[]): Promise<ProductDTO[]> {
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include });
  return rows.map((r) => toDTO(r as unknown as RawProduct));
}

// Coerce a stored TasteProfile row's JSON columns into a typed ProfileInput.
export function profileToInput(p: {
  vibes: unknown;
  categories: unknown;
  sizes: unknown;
  avoid: unknown;
  budgetMin: number;
  budgetMax: number;
}): ProfileInput {
  return {
    vibes: arr(p.vibes),
    categories: arr(p.categories),
    sizes: arr(p.sizes),
    avoid: arr(p.avoid),
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
  };
}
