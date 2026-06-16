// Notification delivery channels. Lets the in-app notification feed also reach
// users when they're away. Channels are env-gated: with no keys configured this
// is a safe no-op that just logs, so the app runs out of the box.
//
//   Email (Resend):  set RESEND_API_KEY and EMAIL_FROM
//   Web push:        add VAPID keys + a PushSubscription store (see README) —
//                    the channel interface below is ready for it.

export type DeliverableNotification = {
  type: string;
  title: string;
  body: string;
};

export type Recipient = {
  email?: string | null;
  registered?: boolean;
};

async function sendEmail(to: string, n: DeliverableNotification): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.EMAIL_FROM ?? "Threadloop <onboarding@resend.dev>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: n.title,
      html: `<div style="font-family:sans-serif"><h2>${n.title}</h2><p>${n.body}</p><p><a href="https://threadloop.app/discover">See your picks →</a></p></div>`,
    }),
  }).catch((e) => console.error("[notify] email failed:", e));
}

// Deliver one notification across every configured channel.
export async function deliver(
  to: Recipient,
  n: DeliverableNotification,
): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (process.env.RESEND_API_KEY && to.registered && to.email) {
    tasks.push(sendEmail(to.email, n));
  }
  // Future: if VAPID + a stored PushSubscription exist, push here.

  if (tasks.length === 0) {
    console.log(`[notify] (no external channel configured) → "${n.title}"`);
    return;
  }
  await Promise.allSettled(tasks);
}
