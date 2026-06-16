// The shared style vocabulary used by the quiz, the catalog, and the
// recommendation engine. Keep these in sync — products are tagged with these
// exact `id`s so matching is a simple set intersection.

export type Vibe = {
  id: string;
  label: string;
  emoji: string;
};

export const VIBES: Vibe[] = [
  { id: "streetwear", label: "Streetwear", emoji: "🛹" },
  { id: "minimal", label: "Minimal", emoji: "◻️" },
  { id: "y2k", label: "Y2K", emoji: "💿" },
  { id: "cottagecore", label: "Cottagecore", emoji: "🌾" },
  { id: "athleisure", label: "Athleisure", emoji: "🏃" },
  { id: "old-money", label: "Old Money", emoji: "🐎" },
  { id: "grunge", label: "Grunge", emoji: "🎸" },
  { id: "coastal", label: "Coastal", emoji: "🐚" },
];

export const CATEGORIES = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "dresses", label: "Dresses" },
  { id: "sneakers", label: "Sneakers" },
  { id: "outerwear", label: "Outerwear" },
  { id: "accessories", label: "Accessories" },
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const AVOID_TAGS = [
  { id: "fur", label: "Fur / leather" },
  { id: "skinny", label: "Skinny fits" },
  { id: "logo-heavy", label: "Big logos" },
  { id: "neon", label: "Neon colors" },
  { id: "crop", label: "Crop tops" },
] as const;

// Budget presets shown in the quiz; stored as [min, max] on the profile.
export const BUDGETS = [
  { id: "thrifty", label: "Under $50", min: 0, max: 50 },
  { id: "smart", label: "$50–$120", min: 50, max: 120 },
  { id: "treat", label: "$120–$250", min: 120, max: 250 },
  { id: "splurge", label: "$250+", min: 250, max: 100000 },
] as const;

export type ProfileInput = {
  vibes: string[];
  categories: string[];
  sizes: string[];
  avoid: string[];
  budgetMin: number;
  budgetMax: number;
};
