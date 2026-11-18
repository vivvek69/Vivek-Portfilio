import type { NextRequest } from "next/server";
import { contactSchema, type ContactResponse } from "@/lib/contact";

/**
 * Contact form endpoint.
 *
 * Delivery uses the Resend REST API and is enabled only when ALL of these
 * server-side environment variables are set (never exposed to the browser):
 *   RESEND_API_KEY      — API key from https://resend.com
 *   CONTACT_TO_EMAIL    — inbox that receives messages
 *   CONTACT_FROM_EMAIL  — verified sender, e.g. "Portfolio <hello@your-domain.com>"
 *
 * Without them the route still validates input but answers 503
 * "not_configured" — it never pretends a message was sent.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 3000;
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // bound memory
  return false;
}

const json = (body: ContactResponse, status: number) => Response.json(body, { status });

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, code: "invalid", error: "Expected a JSON body." }, 415);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "invalid", error: "Invalid JSON body." }, 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fields[k]) fields[k] = issue.message;
    }
    // A filled honeypot is a bot: answer like success, deliver nothing.
    if (fields.company) return json({ ok: true, message: "Thanks!" }, 200);
    return json({ ok: false, code: "invalid", error: "Please fix the highlighted fields.", fields }, 422);
  }

  const data = parsed.data;
  const elapsed = Date.now() - data.startedAt;
  if (elapsed < MIN_FILL_MS || elapsed > 24 * 60 * 60 * 1000) {
    return json({ ok: false, code: "too_fast", error: "That was quicker than a human can type — please try again." }, 400);
  }

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
  if (rateLimited(ip)) {
    return json({ ok: false, code: "rate_limited", error: "Too many messages. Please try again in a few minutes." }, 429);
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return json(
      { ok: false, code: "not_configured", error: "Online delivery isn’t switched on yet. Please email me directly — the address is right beside the form." },
      503
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: data.email,
        subject: `[Portfolio] ${data.subject}`,
        text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
        html: `<p><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error("[contact] Resend responded", res.status);
      return json({ ok: false, code: "delivery_failed", error: "The message couldn’t be delivered right now. Please email me directly." }, 502);
    }
  } catch (err) {
    console.error("[contact] delivery error", err instanceof Error ? err.message : err);
    return json({ ok: false, code: "delivery_failed", error: "The message couldn’t be delivered right now. Please email me directly." }, 502);
  }

  return json({ ok: true, message: "Message sent. I’ll reply to the address you gave." }, 200);
}
