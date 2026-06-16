"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const body = mode === "signup" ? { name, email, password } : { email, password };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(params.get("next") ?? "/discover");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-stone-2 bg-paper p-8"
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-clay">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink">
          {mode === "signup" ? "Save your taste profile" : "Sign in to Threadloop"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {mode === "signup"
            ? "Keep your picks, closet and alerts across every device."
            : "Pick up your closet and personalized picks."}
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="First name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-stone-2 bg-bone px-4 py-3 text-ink outline-none focus:border-ink"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-stone-2 bg-bone px-4 py-3 text-ink outline-none focus:border-ink"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-stone-2 bg-bone px-4 py-3 text-ink outline-none focus:border-ink"
          />

          {error && <p className="text-sm text-clay-deep">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-full bg-ink px-6 py-3 font-heading font-bold text-bone transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
          }}
          className="mt-5 text-sm text-ink-soft hover:text-ink"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </motion.div>
    </div>
  );
}
