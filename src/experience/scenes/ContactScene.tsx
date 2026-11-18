"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2, Mail, Phone, Send, TriangleAlert } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin } from "../ui/BrandIcons";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { profile } from "@/data/resumeData";
import { contactSchema, type ContactInput, type ContactResponse } from "@/lib/contact";
import { Scene } from "../ui/Scene";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; message: string } | { kind: "error"; message: string; offerEmail: boolean };

const channels = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail, copy: profile.email },
  { label: "Phone", value: profile.phone, href: profile.phoneHref, icon: Phone, copy: profile.phone },
  { label: "LinkedIn", value: profile.linkedinHandle, href: profile.linkedin, icon: Linkedin, external: true },
  { label: "GitHub", value: profile.githubHandle, href: profile.github, icon: Github, external: true },
];

/** Screen 09 — Let's Connect. Environment: a signal fire on a ridge. */
export function ContactScene() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "", startedAt },
    mode: "onTouched",
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as ContactResponse;
      if (data.ok) {
        setStatus({ kind: "sent", message: data.message });
        form.reset({ name: "", email: "", subject: "", message: "", company: "", startedAt });
        return;
      }
      if (data.fields) {
        for (const [k, msg] of Object.entries(data.fields)) {
          if (k in values) form.setError(k as keyof ContactInput, { message: msg });
        }
      }
      setStatus({ kind: "error", message: data.error, offerEmail: data.code === "not_configured" || data.code === "delivery_failed" });
    } catch {
      setStatus({ kind: "error", message: "Network error — the message wasn’t sent. Please try again or email me directly.", offerEmail: true });
    }
  });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard unavailable — the link still works */
    }
  };

  const field = "w-full border-0 border-b border-amber/20 bg-transparent px-0 py-3 text-bone placeholder:text-smoke/70 focus:border-amber focus:outline-none focus:ring-0 transition-colors";
  const sending = status.kind === "sending";

  return (
    <Scene id="contact" number="玖 · 09" kanji="結" title="Let’s Connect" subtitle="Open to conversations about AI engineering, agentic systems, and backend work." glow={{ x: "30%", y: "90%" }}>
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <ul className="space-y-1" data-reveal>
          {channels.map((c) => (
            <li key={c.label} className="group flex items-center gap-4 border-b border-amber/10 py-5">
              <c.icon size={20} className="shrink-0 text-amber transition-transform group-hover:scale-110" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[0.62rem] uppercase tracking-[0.35em] text-smoke">{c.label}</p>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="mt-1 block truncate font-display text-lg text-bone transition-colors hover:text-amber md:text-xl"
                >
                  {c.value}
                </a>
              </div>
              {c.copy && (
                <button type="button" onClick={() => copy(c.copy!)} className="btn-ghost !px-2.5 !py-2" aria-label={`Copy ${c.label.toLowerCase()}`}>
                  {copied === c.copy ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                </button>
              )}
            </li>
          ))}
          <li aria-live="polite" className="sr-only">{copied ? "Copied to clipboard" : ""}</li>
        </ul>

        <form onSubmit={submit} noValidate data-reveal style={{ ["--reveal-delay" as string]: "120ms" }} className="lit-panel p-6 md:p-10" aria-describedby="form-status">
          <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
            <div>
              <label htmlFor="cf-name" className="eyebrow !text-[0.62rem]">Full name</label>
              <input id="cf-name" autoComplete="name" className={field} placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-err" : undefined} {...form.register("name")} />
              {errors.name && <p id="cf-name-err" className="mt-2 text-xs text-[#ff8a6a]">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="cf-email" className="eyebrow !text-[0.62rem]">Email address</label>
              <input id="cf-email" type="email" autoComplete="email" inputMode="email" className={field} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-err" : undefined} {...form.register("email")} />
              {errors.email && <p id="cf-email-err" className="mt-2 text-xs text-[#ff8a6a]">{errors.email.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cf-subject" className="eyebrow !text-[0.62rem]">Subject</label>
              <input id="cf-subject" className={field} placeholder="What’s it about?" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "cf-subject-err" : undefined} {...form.register("subject")} />
              {errors.subject && <p id="cf-subject-err" className="mt-2 text-xs text-[#ff8a6a]">{errors.subject.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cf-message" className="eyebrow !text-[0.62rem]">Message</label>
              <textarea id="cf-message" rows={5} className={`${field} resize-y`} placeholder="Tell me about the problem you’re solving…" aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-err" : undefined} {...form.register("message")} />
              {errors.message && <p id="cf-message-err" className="mt-2 text-xs text-[#ff8a6a]">{errors.message.message}</p>}
            </div>
            {/* honeypot: hidden from people and assistive tech */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="cf-company">Company</label>
              <input id="cf-company" tabIndex={-1} autoComplete="off" {...form.register("company")} />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button type="submit" className="btn-flame" disabled={sending}>
              {sending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Send size={14} aria-hidden />}
              {sending ? "Sending…" : "Send message"}
            </button>
            <div id="form-status" role="status" aria-live="polite" className="min-w-0 flex-1 text-sm">
              {status.kind === "sent" && (
                <p className="flex items-center gap-2 text-[#9be7a5]">
                  <Check size={16} aria-hidden /> {status.message}
                </p>
              )}
              {status.kind === "error" && (
                <p className="flex items-start gap-2 text-[#ffb59e]">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <span>
                    {status.message}{" "}
                    {status.offerEmail && (
                      <a className="underline underline-offset-4 hover:text-amber" href={`mailto:${profile.email}?subject=${encodeURIComponent(form.getValues("subject") || "Hello")}&body=${encodeURIComponent(form.getValues("message") || "")}`}>
                        Email {profile.email}
                      </a>
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </Scene>
  );
}
