import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { deliver } from "../src/lib/delivery";

// Daily catalog refresh. In production this would ingest the affiliate feed;
// here it simulates the same events so the rest of the app (New Today, limited
// drops, price drops, notifications) behaves exactly as it will with live data.
//
// Run manually:   npm run refresh
// Schedule daily:  add a cron entry (see README) or a Vercel Cron hitting an
//                  authenticated route that calls this same logic.

const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

const DAY = 24 * 60 * 60 * 1000;
const pickN = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const overlaps = (a: string[], b: string[]) => a.some((x) => b.includes(x));

async function main() {
  const now = new Date();
  const all = await prisma.product.findMany();
  console.log(`Refreshing catalog of ${all.length} products…`);

  // 1) Expire limited drops whose countdown has ended.
  const expired = await prisma.product.updateMany({
    where: { isLimited: true, dropEndsAt: { lt: now } },
    data: { isLimited: false, stock: null, dropEndsAt: null },
  });

  // 2) New arrivals — freshen ~10 products to "today".
  const arrivals = pickN(all, 10);
  for (const p of arrivals) {
    await prisma.product.update({ where: { id: p.id }, data: { arrivedAt: now } });
  }

  // 3) Launch 3 new limited-edition drops.
  const drops = pickN(
    all.filter((p) => !p.isLimited),
    3,
  );
  for (const p of drops) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        isLimited: true,
        stock: 5 + Math.floor(Math.random() * 25),
        dropEndsAt: new Date(now.getTime() + (2 + Math.floor(Math.random() * 5)) * DAY),
      },
    });
  }

  // 4) Price drops on ~5 products.
  const drops2 = pickN(
    all.filter((p) => !p.previousPrice),
    5,
  );
  for (const p of drops2) {
    await prisma.product.update({
      where: { id: p.id },
      data: { previousPrice: p.price, price: Math.max(5, Math.round(p.price * 0.78)) },
    });
  }

  // 5) Notify everyone with a taste profile (in-app feed + any configured channel).
  const profiles = await prisma.tasteProfile.findMany();
  const users = await prisma.user.findMany({
    where: { id: { in: profiles.map((p) => p.userId) } },
    select: { id: true, email: true, passwordHash: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  const arrivalVibes = arrivals.flatMap((p) => p.vibes as string[]);
  const priceDropIds = new Set(drops2.map((d) => d.id));
  let notified = 0;

  // Create the in-app notification and fan it out to external channels.
  const notify = async (
    userId: string,
    data: { type: string; title: string; body: string; productId?: string },
  ) => {
    await prisma.notification.create({ data: { userId, ...data } });
    const u = userMap.get(userId);
    await deliver(
      { email: u?.email, registered: Boolean(u?.passwordHash) },
      { type: data.type, title: data.title, body: data.body },
    );
  };

  for (const prof of profiles) {
    const vibes = prof.vibes as string[];

    // New arrivals matching their vibe.
    const matches = arrivals.filter((p) => overlaps(p.vibes as string[], vibes)).length;
    if (overlaps(arrivalVibes, vibes) && matches > 0) {
      await notify(prof.userId, {
        type: "new_arrival",
        title: `${matches} new piece${matches > 1 ? "s" : ""} for your vibe`,
        body: "Fresh arrivals just landed that match your style profile. Tap Discover to see them.",
      });
      notified++;
    }

    // A limited drop matching their vibe.
    const dropMatch = drops.find((d) => overlaps(d.vibes as string[], vibes));
    if (dropMatch) {
      await notify(prof.userId, {
        type: "limited_drop",
        title: "Limited drop just went live ✦",
        body: `${dropMatch.title.split(" — ")[0]} is a limited release — only a few left.`,
        productId: dropMatch.id,
      });
    }

    // Price drops on items they saved.
    const saved = await prisma.savedItem.findMany({
      where: { userId: prof.userId },
      select: { productId: true },
    });
    for (const s of saved) {
      if (priceDropIds.has(s.productId)) {
        const p = drops2.find((d) => d.id === s.productId)!;
        await notify(prof.userId, {
          type: "price_drop",
          title: "Price drop on something you saved",
          body: `${p.title.split(" — ")[0]} dropped to $${Math.max(5, Math.round(p.price * 0.78))}.`,
          productId: p.id,
        });
      }
    }
  }

  console.log(
    `Done. ${arrivals.length} new arrivals, ${drops.length} limited drops launched, ${expired.count} expired, ${drops2.length} price drops, ${notified} users notified.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
