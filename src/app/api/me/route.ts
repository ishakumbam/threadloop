import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

// Lightweight account state for the nav: are we signed in, and as whom.
export async function GET() {
  const user = await getCurrentUser();
  const registered = Boolean(user?.passwordHash);
  return NextResponse.json({
    registered,
    name: registered ? (user?.name ?? null) : null,
    email: registered ? user?.email : null,
  });
}
