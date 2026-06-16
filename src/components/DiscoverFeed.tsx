"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCard, type CardProduct } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/style";

type Rec = CardProduct & { match: number; reasons: string[]; saved: boolean };

type State =
  | { kind: "loading" }
  | { kind: "no-profile" }
  | { kind: "error" }
  | { kind: "ready"; results: Rec[] };

export function DiscoverFeed() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/recommendations")
      .then(async (res) => {
        if (res.status === 401) return { kind: "no-profile" as const };
        if (!res.ok) return { kind: "error" as const };
        const data = await res.json();
        return { kind: "ready" as const, results: data.results as Rec[] };
      })
      .then((s) => alive && setState(s))
      .catch(() => alive && setState({ kind: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  const isNew = (iso?: string) =>
    Boolean(iso) && Date.now() - new Date(iso as string).getTime() < 24 * 60 * 60 * 1000;

  const visible = useMemo(() => {
    if (state.kind !== "ready") return [];
    if (filter === "all") return state.results;
    if (filter === "new") return state.results.filter((r) => isNew(r.arrivedAt));
    if (filter === "limited") return state.results.filter((r) => r.isLimited);
    return state.results.filter((r) => r.category === filter);
  }, [state, filter]);

  if (state.kind === "loading") {
    return <CenterNote>Curating your feed…</CenterNote>;
  }

  if (state.kind === "no-profile") {
    return (
      <CenterNote>
        <p className="font-heading text-2xl font-bold text-ink">
          No taste profile yet
        </p>
        <p className="mt-2 text-ink-soft">
          Take the 60-second style quiz and we&apos;ll build your feed.
        </p>
        <Link
          href="/quiz"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-heading font-bold text-bone transition-transform hover:scale-[1.03]"
        >
          Take the quiz →
        </Link>
      </CenterNote>
    );
  }

  if (state.kind === "error") {
    return <CenterNote>Something broke. Try refreshing.</CenterNote>;
  }

  const newCount = state.results.filter((r) => isNew(r.arrivedAt)).length;
  const limitedCount = state.results.filter((r) => r.isLimited).length;
  const cats = [
    { id: "all", label: "All" },
    { id: "new", label: `New today${newCount ? ` (${newCount})` : ""}` },
    { id: "limited", label: `✦ Limited${limitedCount ? ` (${limitedCount})` : ""}` },
    ...CATEGORIES,
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-7">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Your picks
        </h1>
        <p className="mt-1 text-ink-soft">
          {state.results.length} pieces matched to your vibe, ranked best-first.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === c.id
                ? "bg-ink text-bone"
                : "border border-stone-2 text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <CenterNote>Nothing in this category yet — try another filter.</CenterNote>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} surface="discover" />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function CenterNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-5 text-center text-ink-soft">
      {children}
    </div>
  );
}
