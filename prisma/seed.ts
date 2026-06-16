import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const retailers = [
  { slug: "everlane", name: "Everlane", brandColor: "#222222", affiliateNetwork: "impact" },
  { slug: "asos", name: "ASOS", brandColor: "#000000", affiliateNetwork: "awin" },
  { slug: "nordstrom", name: "Nordstrom", brandColor: "#1a1a1a", affiliateNetwork: "rakuten" },
  { slug: "aritzia", name: "Aritzia", brandColor: "#2b2b2b", affiliateNetwork: "impact" },
  { slug: "ssense", name: "SSENSE", brandColor: "#111111", affiliateNetwork: "rakuten" },
  { slug: "uniqlo", name: "Uniqlo", brandColor: "#ff0000", affiliateNetwork: null },
  { slug: "nike", name: "Nike", brandColor: "#111111", affiliateNetwork: "awin" },
];

const NEUTRAL_TINT = "#e7e2d8,#d8d2c5";
const DAY = 24 * 60 * 60 * 1000;
const E = "https://www.everlane.com/products/";

// Product manifest — this is the shape an affiliate feed delivers: each row is a
// distinct real product with its OWN image (downloaded to /public/products) and
// its real product-page URL. No two products share a photo.
type Item = {
  title: string;
  category: string;
  price: number;
  image: string;
  slug: string; // Everlane product slug
  vibes: string[];
  tags: string[];
};

const manifest: Item[] = [
  // Tops
  { title: "The Organic Cotton Crew — White", category: "tops", price: 30, image: "organic-cotton-crew", slug: "mens-organic-cotton-crew-tee-white", vibes: ["minimal", "athleisure"], tags: ["cotton", "wardrobe-staple"] },
  { title: "The Classic Crew in Cashmere — Bone", category: "tops", price: 178, image: "cashmere-classic-crew", slug: "womens-cashmere-classic-crew-sweater-bone", vibes: ["old-money", "minimal"], tags: ["cashmere", "cozy"] },
  { title: "The Classic Crew in Cashmere — Navy", category: "tops", price: 178, image: "cashmere-crew-navy", slug: "womens-cashmere-classic-crew-sweater-navy", vibes: ["old-money", "minimal"], tags: ["cashmere", "cozy"] },
  { title: "The Cashmere Slim Crew — Black", category: "tops", price: 178, image: "cashmere-slim-crew-black", slug: "womens-cashmere-slim-crew-sweater-black", vibes: ["old-money", "minimal"], tags: ["cashmere", "cozy"] },
  { title: "The Boxy Crew in Cashmere — Canvas", category: "tops", price: 228, image: "boxy-cashmere-crew", slug: "womens-cashmere-boxy-crew-sweater-canvas", vibes: ["minimal", "cottagecore"], tags: ["cashmere", "cozy", "crop"] },
  { title: "The Air Tee — White", category: "tops", price: 48, image: "air-tee", slug: "womens-air-oversized-crew-tee-white", vibes: ["minimal", "athleisure", "coastal"], tags: ["cotton", "oversized"] },
  { title: "The Air Tee — Black", category: "tops", price: 48, image: "air-tee-black", slug: "womens-air-oversized-crew-tee-black", vibes: ["minimal", "athleisure"], tags: ["cotton", "oversized"] },
  { title: "The Boyfriend Tee — Parchment", category: "tops", price: 48, image: "boyfriend-tee", slug: "womens-organic-ctn-garment-oversized-tee-parchment", vibes: ["streetwear", "minimal"], tags: ["cotton", "oversized"] },
  { title: "The Boyfriend Tee — Black", category: "tops", price: 48, image: "boyfriend-tee-black", slug: "womens-organic-ctn-garment-oversized-tee-black", vibes: ["streetwear", "minimal"], tags: ["cotton", "oversized"] },
  { title: "Oversized Varsity Tee — Washed Black", category: "tops", price: 48, image: "varsity-tee-black", slug: "womens-oversized-varsity-tee-cotton-washed-black", vibes: ["streetwear", "minimal", "athleisure"], tags: ["cotton", "oversized"] },
  { title: "The Oversized Tee in Cotton Linen — White", category: "tops", price: 118, image: "oversized-tee-linen-white", slug: "womens-oversized-tee-in-cotton-linen-white", vibes: ["coastal", "minimal"], tags: ["linen", "oversized"] },
  { title: "The Oversized Shirt — White", category: "tops", price: 118, image: "oversized-shirt-white", slug: "womens-oversized-shirt-cotton-white", vibes: ["minimal", "coastal", "old-money"], tags: ["cotton", "oversized"] },
  // Bottoms
  { title: "Wide-Leg Trouser in Buttersmooth — Black", category: "bottoms", price: 168, image: "wide-leg-trouser", slug: "womens-wide-leg-trouser-in-buttersmooth-black", vibes: ["minimal", "old-money"], tags: ["tailored", "wide-leg"] },
  { title: "The Utility Wide-Leg Pant — Black", category: "bottoms", price: 98, image: "utility-wide-leg-pant", slug: "womens-ctn-twill-utility-wide-leg-pant-black", vibes: ["minimal", "streetwear"], tags: ["utility", "wide-leg"] },
  { title: "Ponte Wide-Leg Trouser — Dark Chocolate", category: "bottoms", price: 148, image: "ponte-trouser-chocolate", slug: "womens-dream-wide-leg-trouser-dark-chocolate", vibes: ["minimal", "old-money"], tags: ["tailored", "wide-leg"] },
  { title: "Corduroy Wide-Leg Trouser — Black", category: "bottoms", price: 148, image: "corduroy-trouser-black", slug: "womens-corduroy-wide-leg-trouser-black", vibes: ["minimal", "old-money", "grunge"], tags: ["corduroy", "wide-leg"] },
  { title: "Wide-Leg Pant in Stretch Linen — Black", category: "bottoms", price: 158, image: "stretch-linen-pant-black", slug: "womens-wide-leg-pant-stretch-linen-black", vibes: ["coastal", "minimal"], tags: ["linen", "wide-leg"] },
  { title: "The '90s Cheeky Jean — Washed Black", category: "bottoms", price: 128, image: "nineties-jean", slug: "womens-90s-cheeky-straight-jean-wshdblk", vibes: ["y2k", "minimal", "grunge"], tags: ["denim", "vintage"] },
  { title: "The '90s Cheeky Jean — Vintage Mid Blue", category: "bottoms", price: 128, image: "jean-mid-blue", slug: "womens-90s-cheeky-straight-jean-vintage-mid-blue", vibes: ["y2k", "minimal"], tags: ["denim", "vintage"] },
  { title: "The '90s Cheeky Jean — Deep Atlantic", category: "bottoms", price: 128, image: "jean-deep-atlantic", slug: "womens-90s-cheeky-straight-jean-deep-atlantic", vibes: ["y2k", "minimal", "grunge"], tags: ["denim", "vintage"] },
  // Dresses
  { title: "The Eyelet Midi Dress — Bone", category: "dresses", price: 150, image: "eyelet-midi-dress", slug: "womens-eyelet-maxi-dress-bone", vibes: ["cottagecore", "coastal"], tags: ["eyelet", "flowy", "cotton"] },
  { title: "The Linen A-Line Midi Dress — Black", category: "dresses", price: 150, image: "linen-a-line-dress", slug: "womens-linen-a-line-midi-dress-black", vibes: ["minimal", "coastal"], tags: ["linen", "breathable"] },
  { title: "Midi Dress in Cotton Silk Voile — Black", category: "dresses", price: 228, image: "silk-voile-dress-black", slug: "womens-midi-dress-in-cotton-silk-voile-black", vibes: ["old-money", "minimal", "coastal"], tags: ["silk", "flowy"] },
  { title: "The Midi Dress in SoftLuxe — Black", category: "dresses", price: 168, image: "softluxe-dress-black", slug: "womens-midi-dress-softluxe-black", vibes: ["minimal", "coastal"], tags: ["flowy", "breathable"] },
  { title: "Linen Scoop Midi Dress — Dark Sea", category: "dresses", price: 128, image: "linen-scoop-dress-darksea", slug: "womens-linen-ss-scoop-midi-dress-dark-sea", vibes: ["coastal", "cottagecore"], tags: ["linen", "breathable"] },
  { title: "Weekend Tee Midi Dress — Black", category: "dresses", price: 78, image: "weekend-tee-dress-black", slug: "womens-weekend-tee-midi-dress-black", vibes: ["minimal", "streetwear", "athleisure"], tags: ["cotton", "oversized"] },
  { title: "Midi Dress in Everyday Cotton — Black", category: "dresses", price: 128, image: "everyday-cotton-dress-black", slug: "womens-midi-dress-everyday-cotton-black", vibes: ["minimal"], tags: ["cotton"] },
  // Outerwear
  { title: "The Cocoon Coat in Wool — Oat", category: "outerwear", price: 248, image: "cocoon-coat", slug: "womens-rewool-cocoon-coat-oat", vibes: ["old-money", "minimal"], tags: ["wool", "warm", "tailored"] },
  { title: "The Cocoon Coat in Wool — Heather Charcoal", category: "outerwear", price: 248, image: "cocoon-coat-charcoal", slug: "womens-rewool-cocoon-coat-heather-charcoal", vibes: ["old-money", "minimal"], tags: ["wool", "warm", "tailored"] },
  { title: "The Modern Trench Coat — Cornstalk", category: "outerwear", price: 288, image: "modern-trench", slug: "womens-cotton-modern-trench-coat-new-cornstalk", vibes: ["old-money", "minimal", "coastal"], tags: ["cotton", "tailored"] },
  { title: "The Trench Coat — Black", category: "outerwear", price: 268, image: "trench-black", slug: "womens-cotton-modern-trench-coat-black", vibes: ["old-money", "minimal", "coastal"], tags: ["cotton", "tailored"] },
  { title: "The Modern Jean Jacket — Stone-Washed Sky", category: "outerwear", price: 88, image: "jean-jacket", slug: "womens-modern-denim-jacket-washed-sky", vibes: ["y2k", "streetwear", "minimal"], tags: ["denim"] },
  { title: "The Modern Jean Jacket — Washed Midnight", category: "outerwear", price: 88, image: "denim-jacket-midnight", slug: "womens-modern-denim-jacket-washed-midnight", vibes: ["y2k", "streetwear", "minimal"], tags: ["denim"] },
  { title: "The Denim Chore Jacket — Garment-Dyed Navy", category: "outerwear", price: 228, image: "chore-jacket-navy", slug: "womens-denim-chore-jacket-dyed-navy", vibes: ["streetwear", "minimal", "grunge"], tags: ["denim", "utility"] },
  { title: "Cropped Denim Jacket — Garment-Dyed Indigo", category: "outerwear", price: 188, image: "cropped-denim-indigo", slug: "womens-cropped-denim-jacket-garment-dyed-indigo", vibes: ["y2k", "streetwear"], tags: ["denim", "crop"] },
  // Sneakers
  { title: "The Court Sneaker — White", category: "sneakers", price: 115, image: "court-sneaker", slug: "womens-court-sneaker-white", vibes: ["minimal", "old-money", "athleisure"], tags: ["leather", "classic"] },
  { title: "The Court Sneaker — White / Grass Green", category: "sneakers", price: 148, image: "court-sneaker-green", slug: "womens-court-sneaker-white-grass-green", vibes: ["minimal", "athleisure", "coastal"], tags: ["leather", "classic"] },
  { title: "The ReLeather Court Sneaker — Off White", category: "sneakers", price: 130, image: "releather-sneaker", slug: "mens-releather-court-sneaker-off-white-black", vibes: ["minimal", "streetwear"], tags: ["leather", "classic"] },
  // Accessories
  { title: "The Day Market Tote — Black", category: "accessories", price: 175, image: "day-market-tote", slug: "womens-day-market-tote-black", vibes: ["minimal", "old-money"], tags: ["leather", "everyday"] },
  { title: "The New Day Market Tote — Black", category: "accessories", price: 135, image: "new-day-tote-black", slug: "womens-new-day-market-tote-black", vibes: ["minimal", "old-money"], tags: ["everyday"] },
  { title: "The Cashmere Rib Beanie — Bone", category: "accessories", price: 55, image: "cashmere-beanie", slug: "womens-cashmere-rib-beanie-2-bone", vibes: ["minimal", "old-money", "cottagecore"], tags: ["cashmere", "cozy"] },
  { title: "The Cashmere Rib Beanie — Tiger's Eye", category: "accessories", price: 98, image: "beanie-tigers-eye", slug: "womens-cashmere-rib-beanie-2-tigers-eye", vibes: ["old-money", "cottagecore"], tags: ["cashmere", "cozy"] },
  { title: "The Cashmere Fine Rib Beanie — Black", category: "accessories", price: 98, image: "cashmere-beanie-black", slug: "mens-cashmere-beanie2-black", vibes: ["minimal", "old-money"], tags: ["cashmere", "cozy"] },
];

const sizesFor = (c: string): string[] =>
  c === "sneakers" ? ["S", "M", "L", "XL"]
  : c === "accessories" ? ["XS", "S", "M", "L", "XL", "XXL"]
  : ["XS", "S", "M", "L", "XL"];

async function main() {
  console.log("Seeding…");
  await prisma.notification.deleteMany();
  await prisma.clickOut.deleteMany();
  await prisma.savedItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();

  const retailerIds: Record<string, string> = {};
  for (const r of retailers) {
    const created = await prisma.retailer.create({ data: r });
    retailerIds[r.slug] = created.id;
  }
  const everlane = retailerIds["everlane"];

  let limited = 0;
  for (let i = 0; i < manifest.length; i++) {
    const m = manifest[i];
    const isLimited = Math.random() < 0.12;
    if (isLimited) limited++;
    const hasDrop = Math.random() < 0.2;
    // Spread ~10 arrivals into the last day so "New today" has content.
    const arrivedAt =
      i % 4 === 0
        ? new Date(Date.now() - Math.floor(Math.random() * 12) * 60 * 60 * 1000)
        : new Date(Date.now() - Math.floor(Math.random() * 30) * DAY);

    await prisma.product.create({
      data: {
        title: m.title,
        brand: "Everlane",
        category: m.category,
        price: m.price,
        previousPrice: hasDrop ? Math.round(m.price * (1.25 + Math.random() * 0.4)) : null,
        imageUrl: `/products/${m.image}.jpg`,
        gradient: NEUTRAL_TINT,
        vibes: m.vibes,
        colors: [m.title.split(" — ")[1]?.toLowerCase() ?? "neutral"],
        sizes: sizesFor(m.category),
        tags: m.tags,
        externalUrl: `${E}${m.slug}`,
        retailerId: everlane,
        isLimited,
        stock: isLimited ? 4 + Math.floor(Math.random() * 30) : null,
        arrivedAt,
        dropEndsAt: isLimited ? new Date(Date.now() + (1 + Math.floor(Math.random() * 7)) * DAY) : null,
      },
    });
  }

  console.log(
    `Seeded ${retailers.length} retailers and ${manifest.length} distinct products (${limited} limited-edition).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
