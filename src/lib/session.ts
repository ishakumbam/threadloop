import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const COOKIE = "tl_uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Read-only: safe to call from Server Components. Returns the signed-in shopper
// or null. This is a passwordless stub — replace with Clerk/Supabase Auth later.
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

// Mutating: only call from Route Handlers / Server Actions (it can set cookies).
// Resolves the current user, lazily creating an anonymous one on first use.
export async function ensureUser(): Promise<User> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;

  if (id) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (existing) return existing;
  }

  const user = await prisma.user.create({
    data: { email: `guest_${crypto.randomUUID()}@threadloop.local` },
  });

  jar.set(COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return user;
}

// Point the session cookie at a specific user (used by login/signup).
export async function setSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// Clear the session (logout). Guests get a fresh anonymous id on next action.
export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
