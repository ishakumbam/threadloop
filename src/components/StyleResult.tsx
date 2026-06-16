"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Vibe } from "@/lib/style";

export function StyleResult({ vibes, slug }: { vibes: Vibe[]; slug: string }) {
  const [copied, setCopied] = useState(false);
  const label = vibes.map((v) => v.label).join(" + ") || "Curated";

  async function share() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/style/${slug}` : "";
    const text = `My Threadloop style is ${label}. Find yours:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Threadloop style", text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-xl flex-col justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-stone-2 bg-paper"
      >
        <div className="bg-ink px-8 py-10 text-center text-bone">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-bone/60">
            Your style profile
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
            {label}
          </h1>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {vibes.map((v) => (
              <span
                key={v.id}
                className="rounded-full bg-bone/10 px-3 py-1.5 text-sm font-semibold"
              >
                {v.emoji} {v.label}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8 text-center">
          <p className="text-ink-soft">
            We&apos;ll hunt every store for pieces that match this — and send you
            straight to checkout.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/discover"
              className="rounded-full bg-ink px-7 py-3.5 font-heading font-bold text-bone transition-transform hover:scale-[1.03]"
            >
              See my picks →
            </Link>
            <button
              onClick={share}
              className="rounded-full border border-stone-2 px-7 py-3.5 font-heading font-bold text-ink transition-colors hover:bg-stone"
            >
              {copied ? "Link copied ✓" : "Share my style"}
            </button>
          </div>
          <Link
            href="/quiz"
            className="mt-5 inline-block text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Retake the quiz
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
