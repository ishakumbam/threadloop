"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HERO_IMAGE } from "@/lib/images";

const BRANDS = [
  "ASOS",
  "Nordstrom",
  "Aritzia",
  "SSENSE",
  "Uniqlo",
  "Depop",
  "Everlane",
  "Nike",
];

const STEPS = [
  {
    n: "01",
    title: "Tell us your vibe",
    body: "A 60-second quiz: your style, sizes, budget, and the things you can't stand.",
  },
  {
    n: "02",
    title: "We hunt every store",
    body: "We rank pieces across dozens of retailers so you stop opening fourteen tabs.",
  },
  {
    n: "03",
    title: "Buy at the source",
    body: "Love it? We send you straight to the store's own checkout. You buy there.",
  },
];

export function Landing() {
  return (
    <div>
      {/* Hero — editorial split */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:pt-16">
        <div className="order-2 md:order-1">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-clay"
          >
            We don&apos;t sell clothes. We find them.
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-heading text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            Shop every
            <br />
            store at once.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-md text-lg text-ink-soft"
          >
            Threadloop learns your taste, then does the hunting across ASOS,
            Nordstrom, SSENSE and more — and sends you straight to checkout.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login?mode=signup&next=/quiz"
                className="rounded-full bg-ink px-7 py-3.5 font-heading text-base font-bold text-bone transition-transform hover:scale-[1.03] active:scale-95"
              >
                Create account & save →
              </Link>
              <Link
                href="/quiz"
                className="rounded-full border border-stone-2 px-7 py-3.5 font-heading text-base font-bold text-ink transition-colors hover:bg-stone"
              >
                Continue as guest
              </Link>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Saving keeps your picks, closet &amp; alerts across devices.{" "}
              <Link
                href="/login"
                className="font-semibold text-ink underline underline-offset-2"
              >
                Already have an account? Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="order-1 overflow-hidden rounded-3xl bg-stone md:order-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Editorial neutral-toned look"
            className="aspect-[3/4] h-full w-full object-cover"
          />
        </motion.div>
      </section>

      {/* Brand marquee */}
      <section className="border-y border-stone-2/70 py-5">
        <div className="flex w-max tl-marquee gap-14 px-7">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span
              key={i}
              className="font-heading text-xl font-semibold tracking-wide text-ink-soft/55"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="mb-12 max-w-md font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          The work happens here. The buying happens there.
        </h2>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-stone-2 bg-stone-2 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="bg-paper p-8"
            >
              <span className="font-heading text-3xl font-extrabold text-clay">
                {s.n}
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-[2rem] bg-ink px-8 py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-bone sm:text-5xl">
            Stop scrolling. Start finding.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-bone/70">
            Build your taste profile once. We&apos;ll keep the picks coming.
          </p>
          <Link
            href="/quiz"
            className="mt-8 inline-block rounded-full bg-clay px-8 py-3.5 font-heading text-base font-bold text-bone transition-transform hover:scale-[1.03] active:scale-95"
          >
            Find my style →
          </Link>
        </div>
      </section>
    </div>
  );
}
