"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type CardProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  imageUrl?: string | null; // the retailer's own product photo
  gradient: string; // legacy fallback tint
  vibes: string[];
  retailer: { name: string; brandColor: string };
  match?: number;
  reasons?: string[];
  saved?: boolean;
  isLimited?: boolean;
  stock?: number | null;
  previousPrice?: number | null;
  arrivedAt?: string;
};

const isNew = (iso?: string) =>
  Boolean(iso) && Date.now() - new Date(iso as string).getTime() < 24 * 60 * 60 * 1000;

export function ProductCard({
  product,
  surface = "discover",
  onUnsave,
}: {
  product: CardProduct;
  surface?: string;
  onUnsave?: (id: string) => void;
}) {
  const [saved, setSaved] = useState(Boolean(product.saved));
  const [pending, setPending] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(product.imageUrl) && !imgFailed;

  async function toggleSave() {
    setPending(true);
    const next = !saved;
    setSaved(next);
    try {
      await fetch("/api/saved", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!next) onUnsave?.(product.id);
    } catch {
      setSaved(!next); // revert on failure
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="group flex flex-col"
    >
      {/* The retailer's own product photo (falls back to a neutral tile) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl as string}
            alt={product.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone">
            <span className="font-heading text-2xl font-bold tracking-tight text-stone-2">
              {product.brand}
            </span>
          </div>
        )}

        <button
          onClick={toggleSave}
          disabled={pending}
          aria-label={saved ? "Remove from closet" : "Save to closet"}
          className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-bone/85 text-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
        >
          {saved ? "♥" : "♡"}
        </button>

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {product.isLimited && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-bone">
              Limited{typeof product.stock === "number" ? ` · ${product.stock} left` : ""}
            </span>
          )}
          {isNew(product.arrivedAt) && !product.isLimited && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-bone">
              New today
            </span>
          )}
          {typeof product.match === "number" && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-bone">
              {product.match}% match
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          {product.brand}
        </p>
        <h3 className="font-heading text-base font-bold leading-tight text-ink">
          {product.title}
        </h3>

        {product.reasons?.length ? (
          <p className="mt-0.5 text-sm text-ink-soft">{product.reasons[0]}</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1.5">
            <span
              className={`font-heading text-lg font-bold ${
                product.previousPrice ? "text-clay-deep" : "text-ink"
              }`}
            >
              ${product.price}
            </span>
            {product.previousPrice ? (
              <span className="text-sm text-ink-soft line-through">
                ${product.previousPrice}
              </span>
            ) : null}
          </span>
          <a
            href={`/go/${product.id}?ref=${surface}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-bone"
          >
            {product.retailer.name} →
          </a>
        </div>
      </div>
    </motion.div>
  );
}
