"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/closet", label: "Closet" },
  { href: "/quiz", label: "Style quiz" },
];

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<{ registered: boolean; name: string | null } | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [meRes, nRes] = await Promise.all([
        fetch("/api/me").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
      ]);
      setMe(meRes);
      setNotifs(nRes.notifications ?? []);
      setUnread(nRes.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  async function openBell() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      await fetch("/api/notifications", { method: "POST", body: "{}" });
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ registered: false, name: null });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-2/70 bg-bone/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-xl font-extrabold tracking-tight text-ink">
            threadloop
          </span>
          <span className="hidden text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft sm:inline">
            curated
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`hidden rounded-full px-3.5 py-2 font-medium transition-colors sm:block ${
                  active ? "bg-ink text-bone" : "text-ink-soft hover:bg-stone hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={openBell}
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-stone hover:text-ink"
            >
              <span className="text-lg">◔</span>
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[0.6rem] font-bold text-bone">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-2 bg-paper shadow-xl"
                >
                  <div className="border-b border-stone-2 px-4 py-3 font-heading font-bold text-ink">
                    Notifications
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-ink-soft">
                        Nothing yet. Take the quiz and we&apos;ll alert you on new
                        matches & drops.
                      </p>
                    ) : (
                      notifs.map((n) => (
                        <div
                          key={n.id}
                          className={`border-b border-stone-2/60 px-4 py-3 ${
                            n.read ? "" : "bg-bone"
                          }`}
                        >
                          <p className="text-sm font-semibold text-ink">{n.title}</p>
                          <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account */}
          {me?.registered ? (
            <button
              onClick={logout}
              className="rounded-full border border-stone-2 px-3.5 py-2 font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {me.name ? `Hi, ${me.name}` : "Sign out"}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-3.5 py-2 font-medium text-bone transition-transform hover:scale-[1.03]"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
