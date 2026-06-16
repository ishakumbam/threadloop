import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCurrentUser, ensureUser, setSession } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  name: z.string().trim().min(1).max(60).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, password, name } = parsed.data;

  // Email already registered?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    return NextResponse.json({ error: "That email already has an account" }, { status: 409 });
  }

  const passwordHash = hashPassword(password);

  // Upgrade the current anonymous guest (creating one if needed) so their quiz
  // answers and saved closet carry straight into the new account.
  const guest = (await getCurrentUser()) ?? (await ensureUser());
  const account = await prisma.user.update({
    where: { id: guest.id },
    data: { email, name, passwordHash },
  });

  await setSession(account.id);

  await prisma.notification.create({
    data: {
      userId: account.id,
      type: "new_arrival",
      title: "Welcome to Threadloop ✦",
      body: "Your picks now follow you across devices. We'll ping you when new pieces and limited drops match your taste.",
    },
  });

  return NextResponse.json({ ok: true, name: account.name ?? null });
}
