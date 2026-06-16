import type { ProfileInput } from "@/lib/style";

// Minimal shape the scorer needs — works on Prisma rows or seed objects.
export type ScorableProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  vibes: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
};

export type Scored<T> = T & {
  score: number;
  reasons: string[];
  match: number; // 0–100, for display
};

const W = {
  vibe: 30, // per matching vibe
  category: 18,
  size: 14,
  budget: 12,
  avoidPenalty: -1000, // effectively excludes
} as const;

// Score one product against a taste profile. Higher is better. Products that
// hit an "avoid" tag get a huge penalty so they fall out of the results.
export function scoreProduct<T extends ScorableProduct>(
  product: T,
  profile: ProfileInput,
): Scored<T> {
  let score = 0;
  const reasons: string[] = [];

  const vibeHits = product.vibes.filter((v) => profile.vibes.includes(v));
  if (vibeHits.length) {
    score += vibeHits.length * W.vibe;
    reasons.push(`Matches your ${vibeHits.join(" + ")} vibe`);
  }

  if (profile.categories.includes(product.category)) {
    score += W.category;
    reasons.push(`You're shopping ${product.category}`);
  }

  const sizeHit = product.sizes.some((s) => profile.sizes.includes(s));
  if (sizeHit) {
    score += W.size;
    reasons.push("Available in your size");
  }

  const inBudget =
    product.price >= profile.budgetMin && product.price <= profile.budgetMax;
  if (inBudget) {
    score += W.budget;
    reasons.push("In your budget");
  } else if (product.price < profile.budgetMin) {
    reasons.push("Below your usual budget");
  }

  const avoided = product.tags.filter((t) => profile.avoid.includes(t));
  if (avoided.length) {
    score += W.avoidPenalty;
  }

  // Normalize to a friendly 0–100 match for the UI.
  const maxPossible =
    profile.vibes.length * W.vibe + W.category + W.size + W.budget;
  const match = Math.max(
    0,
    Math.min(100, Math.round((score / Math.max(maxPossible, 1)) * 100)),
  );

  return { ...product, score, reasons, match };
}

// Rank a catalog for a profile. Drops avoided items, sorts best-first.
export function recommend<T extends ScorableProduct>(
  products: T[],
  profile: ProfileInput,
): Scored<T>[] {
  return products
    .map((p) => scoreProduct(p, profile))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}
