import { z } from "zod";

/** Shared by the client form and the /api/contact route so validation can never drift. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  email: z.string().trim().max(200, "Email is too long.").pipe(z.email("Enter a valid email address.")),
  subject: z.string().trim().min(3, "Add a short subject.").max(150, "Subject is too long."),
  message: z.string().trim().min(10, "Your message needs at least 10 characters.").max(5000, "Message is too long (5000 max)."),
  /** Honeypot — humans never see or fill this field. */
  company: z.string().max(0).optional().or(z.literal("")),
  /** Epoch ms when the form was first rendered (bot timing check). */
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.input<typeof contactSchema>;

export type ContactResponse =
  | { ok: true; message: string }
  | { ok: false; code: "invalid" | "rate_limited" | "not_configured" | "delivery_failed" | "too_fast"; error: string; fields?: Record<string, string> };
