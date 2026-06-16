"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  VIBES,
  CATEGORIES,
  SIZES,
  AVOID_TAGS,
  BUDGETS,
} from "@/lib/style";

type Chip = { id: string; label: string; emoji?: string };

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function ChipGrid({
  options,
  selected,
  onToggle,
  columns = "grid-cols-2 sm:grid-cols-4",
}: {
  options: Chip[];
  selected: string[];
  onToggle: (id: string) => void;
  columns?: string;
}) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all active:scale-95 ${
              active
                ? "border-ink bg-ink text-bone"
                : "border-stone-2 bg-paper text-ink hover:border-ink"
            }`}
          >
            {o.emoji ? <span className="text-lg">{o.emoji}</span> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [vibes, setVibes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [budgetId, setBudgetId] = useState<string>("smart");
  const [avoid, setAvoid] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo(
    () => [
      {
        title: "What's your vibe?",
        sub: "Pick everything that feels like you.",
        valid: vibes.length > 0,
        node: (
          <ChipGrid
            options={VIBES}
            selected={vibes}
            onToggle={(id) => setVibes((v) => toggle(v, id))}
          />
        ),
      },
      {
        title: "What are you shopping for?",
        sub: "We'll lead with these categories.",
        valid: true,
        node: (
          <ChipGrid
            options={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
            selected={categories}
            onToggle={(id) => setCategories((v) => toggle(v, id))}
            columns="grid-cols-2 sm:grid-cols-3"
          />
        ),
      },
      {
        title: "Your sizes?",
        sub: "So we only show you things that'll actually fit.",
        valid: sizes.length > 0,
        node: (
          <ChipGrid
            options={SIZES.map((s) => ({ id: s, label: s }))}
            selected={sizes}
            onToggle={(id) => setSizes((v) => toggle(v, id))}
            columns="grid-cols-3 sm:grid-cols-6"
          />
        ),
      },
      {
        title: "What's your budget?",
        sub: "Per piece, roughly.",
        valid: true,
        node: (
          <ChipGrid
            options={BUDGETS.map((b) => ({ id: b.id, label: b.label }))}
            selected={[budgetId]}
            onToggle={(id) => setBudgetId(id)}
          />
        ),
      },
      {
        title: "Anything you hate?",
        sub: "We'll quietly filter these out. Skip if nothing applies.",
        valid: true,
        node: (
          <ChipGrid
            options={AVOID_TAGS.map((a) => ({ id: a.id, label: a.label }))}
            selected={avoid}
            onToggle={(id) => setAvoid((v) => toggle(v, id))}
            columns="grid-cols-2 sm:grid-cols-3"
          />
        ),
      },
    ],
    [vibes, categories, sizes, budgetId, avoid],
  );

  const current = steps[step];
  const isLast = step === steps.length - 1;

  async function finish() {
    setSubmitting(true);
    setError(null);
    const budget = BUDGETS.find((b) => b.id === budgetId)!;
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibes,
          categories,
          sizes,
          avoid,
          budgetMin: budget.min,
          budgetMax: budget.max,
        }),
      });
      if (!res.ok) throw new Error("Could not save your profile");
      // Land on the shareable style-result card (viral loop), not straight to the feed.
      router.push(`/style/${encodeURIComponent(vibes.join("_"))}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10">
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-ink" : "bg-stone-2"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-clay">
            Step {step + 1} of {steps.length}
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {current.title}
          </h1>
          <p className="mb-7 mt-1 text-ink-soft">{current.sub}</p>
          {current.node}
        </motion.div>
      </AnimatePresence>

      {error ? <p className="mt-5 text-sm text-clay-deep">{error}</p> : null}

      <div className="mt-9 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink ${
            step === 0 ? "invisible" : ""
          }`}
        >
          ← Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={finish}
            disabled={submitting}
            className="rounded-full bg-ink px-7 py-3 font-heading font-bold text-bone transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Curating…" : "See my picks →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => current.valid && setStep((s) => s + 1)}
            disabled={!current.valid}
            className="rounded-full bg-ink px-7 py-3 font-heading font-bold text-bone transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
