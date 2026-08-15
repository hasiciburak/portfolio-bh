import { Resend } from "resend";

import { contactAddress } from "@/lib/contact-mailto";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";

/** Where the message lands. Same source as the address printed on the page. */
const TO = contactAddress(
  SITE_SOCIAL_LINKS.find(({ id }) => id === "email")?.href ?? "",
);

/**
 * Resend will only deliver from a domain verified in the account. Until
 * burakhasici.com is verified there, their shared `onboarding@resend.dev` sender
 * works — but only to the account owner's own address, which is exactly where
 * this route sends, so it is enough to test with and not enough to ship on.
 */
const FROM = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

const MAX = { name: 100, email: 254, message: 4000 } as const;

/*
 * Deliberately shallow: it rejects addresses that cannot possibly work rather
 * than trying to decide which exotic ones are real. The reply-to is the only
 * thing that depends on it, and a wrong-but-plausible address fails at reply time
 * no matter how strict this is.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * Best-effort, per-instance. Serverless functions do not share memory, so a
 * determined sender gets one bucket per warm instance — this stops accidental
 * double-submits and casual spam, not a real flood. A shared store is the fix if
 * that ever becomes the problem.
 */
const RATE_LIMIT = { max: 3, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(
    (at) => now - at < RATE_LIMIT.windowMs,
  );

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);
  return false;
};

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !TO) {
    // A misconfigured deploy is our problem, not the sender's — but they still
    // need to be told the message did not get through.
    console.error("contact: RESEND_API_KEY or recipient missing");
    return Response.json({ error: "unavailable" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const honeypot = String(body.company ?? "").trim();

  /*
   * A bot that fills every field it finds gets a 200 and nothing else. Telling it
   * why it was rejected is how it learns to skip the field next time.
   */
  if (honeypot) return Response.json({ ok: true });

  if (
    !name ||
    !message ||
    !EMAIL_SHAPE.test(email) ||
    name.length > MAX.name ||
    email.length > MAX.email ||
    message.length > MAX.message
  ) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `Portfolio <${FROM}>`,
      to: [TO],
      // Hitting reply goes to the sender rather than the Resend sender address.
      replyTo: email,
      subject: `Portfolio — ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("contact: resend rejected the send", error);
      return Response.json({ error: "send_failed" }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (cause) {
    console.error("contact: send threw", cause);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
}
