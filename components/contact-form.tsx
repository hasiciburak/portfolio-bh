"use client";

import { useState } from "react";

import { useTranslation } from "@/components/language-provider";

type Status = "idle" | "sending" | "sent" | "error";
type Field = "name" | "email" | "message";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * Fields sit on the card, so they take the lighter surface and the card takes the
 * border. Giving both a fill of the same weight read as a frame inside a frame.
 */
const FIELD_BASE =
  "w-full rounded-xl border border-zinc-950/10 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus-visible:border-zinc-950/30 focus-visible:ring-2 focus-visible:ring-zinc-950/15 dark:border-white/12 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-white/35 dark:focus-visible:border-white/35 dark:focus-visible:ring-white/20";

const FIELD_INVALID =
  "border-red-500/60 focus-visible:border-red-500/70 focus-visible:ring-red-500/20 dark:border-red-400/60 dark:focus-visible:border-red-400/70";

/**
 * The form half of the contact section. The address above it stays — this is the
 * lower-friction path for someone who does not want to leave the page, not a
 * replacement for the one that cannot break.
 *
 * Validates before it posts so a mistyped address is caught next to the field
 * rather than as a generic failure after a round trip.
 */
export const ContactForm = () => {
  const { dict } = useTranslation();
  const copy = dict.contact;

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const validate = (values: Record<Field, string>) => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = copy.form_name_required;
    if (!EMAIL_SHAPE.test(values.email.trim()))
      next.email = copy.form_email_invalid;
    if (!values.message.trim()) next.message = copy.form_message_required;
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          company: String(data.get("company") ?? ""),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  /** Clears a field's error as soon as it is edited, rather than on next submit. */
  const clearError = (field: Field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  return (
    // The panel around the whole section is the frame; a second one here would
    // nest a card inside a card.
    <form onSubmit={handleSubmit} noValidate className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm text-zinc-600 dark:text-white/60">
            {copy.form_name}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={copy.form_name_placeholder}
            maxLength={100}
            onChange={() => clearError("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={`${FIELD_BASE} ${errors.name ? FIELD_INVALID : ""}`}
          />
          {errors.name ? (
            <p id="contact-name-error" className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm text-zinc-600 dark:text-white/60">
            {copy.form_email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={copy.form_email_placeholder}
            maxLength={254}
            onChange={() => clearError("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={`${FIELD_BASE} ${errors.email ? FIELD_INVALID : ""}`}
          />
          {errors.email ? (
            <p id="contact-email-error" className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="mb-1.5 block text-sm text-zinc-600 dark:text-white/60">
          {copy.form_message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={copy.form_message_placeholder}
          maxLength={4000}
          onChange={() => clearError("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${FIELD_BASE} resize-y ${errors.message ? FIELD_INVALID : ""}`}
        />
        {errors.message ? (
          <p id="contact-message-error" className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/*
        Honeypot. Off-screen rather than `display: none`, which the bots worth
        catching already know to skip, and out of the tab order and the
        accessibility tree so nobody human ever meets it.
      */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Full width, so the column ends on one unambiguous next step. */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 w-full rounded-full bg-zinc-950 px-5 py-3 text-[15px] font-medium leading-tight text-white outline-none transition-colors hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950/30 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90 dark:focus-visible:ring-white/40"
      >
        {status === "sending" ? copy.form_sending : copy.form_send}
      </button>

      {/*
        One live region for both outcomes, outside the button so the button's own
        name never changes underneath a screen reader mid-submit.
      */}
      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${
          status === "error"
            ? "text-red-600 dark:text-red-400"
            : "text-zinc-600 dark:text-white/60"
        }`}
      >
        {status === "sent" ? copy.form_sent : null}
        {status === "error" ? copy.form_error : null}
      </p>
    </form>
  );
};
