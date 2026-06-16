"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCard, type CardProduct } from "@/components/ProductCard";

export function ClosetList({ initial }: { initial: CardProduct[] }) {
  const [items, setItems] = useState(initial);

  function remove(id: string) {
    setItems((list) => list.filter((p) => p.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="font-heading text-5xl text-stone-2">♡</p>
        <p className="mt-4 font-heading text-2xl font-bold text-ink">
          Your closet is empty
        </p>
        <p className="mt-2 text-ink-soft">
          Tap the heart on anything you love and it&apos;ll land here.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-heading font-bold text-bone transition-transform hover:scale-[1.03]"
        >
          Browse picks →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="mb-1 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Your closet
      </h1>
      <p className="mb-7 text-ink-soft">
        {items.length} saved {items.length === 1 ? "piece" : "pieces"}.
      </p>
      <motion.div
        layout
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={{ ...p, saved: true }}
              surface="closet"
              onUnsave={remove}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
