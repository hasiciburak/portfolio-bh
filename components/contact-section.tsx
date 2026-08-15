"use client";

import { useEffect, useRef, useState } from "react";

import { ContactForm } from "@/components/contact-form";
import { useTranslation } from "@/components/language-provider";
import { buildContactMailto, contactAddress } from "@/lib/contact-mailto";
import { SECTION_EYEBROW } from "@/lib/section-eyebrow";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";

type CopyStatus = "idle" | "copied" | "failed";

/** Long enough to read, short enough that the button is a call to action again. */
const RESET_MS = 2200;

const EMAIL_LINK = SITE_SOCIAL_LINKS.find(({ id }) => id === "email");

const CopyIcon = ({ copied }: { copied: boolean }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
    {copied ? (
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <rect
          x={9}
          y={9}
          width={11}
          height={11}
          rx={2}
          stroke="currentColor"
          strokeWidth={1.75}
        />
        <path
          d="M5 15V6a2 2 0 012-2h9"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

/**
 * The page's closing call to action, and the answer to `mailto:` being the only
 * way in.
 *
 * A `mailto:` link does nothing at all on a machine with no mail client
 * configured — which describes most corporate laptops, where HR lives in Outlook
 * Web or Gmail in a browser tab. That made the one moment someone decided to get
 * in touch a dead click with nothing to fall back on: the address itself was never
 * written down anywhere on the desktop layout, only wrapped inside an icon.
 *
 * So the address is now plain text first and a link second. Copying is a
 * convenience on top; if the clipboard API is unavailable or refused, the button
 * says so rather than claiming success, and the address is still sitting there to
 * select by hand.
 */
export const ContactSection = () => {
  const { dict } = useTranslation();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  if (!EMAIL_LINK) return null;

  const address = contactAddress(EMAIL_LINK.href);
  const copy = dict.contact;

  const handleCopy = async () => {
    if (timer.current) window.clearTimeout(timer.current);

    try {
      await navigator.clipboard.writeText(address);
      setStatus("copied");
    } catch {
      // Insecure context, or the user denied it. Either way, do not pretend.
      setStatus("failed");
    }

    timer.current = window.setTimeout(() => setStatus("idle"), RESET_MS);
  };

  return (
    <section
      id="contact"
      className="w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="contact-heading"
    >
      {/*
        Asymmetric on purpose, to land symmetric on screen. A full section's worth
        of top padding stacked on the previous section's bottom padding put 224px
        above the panel against 152px below it. The panel only needs enough space
        to clear what is already there; the footer's own padding does the same job
        underneath.
      */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:pb-20 lg:pb-28">
        {/*
          One panel around the whole closing section. It gives the page a
          deliberate end — an edge to stop at — rather than the copy and the form
          trailing off into the footer on the same flat ground.
        */}
        {/*
          No panel on a phone. At 375px its border sits a thumb's width from both
          screen edges and its padding eats the room the fields need, for an
          enclosure the single-column stack already reads as without it.
        */}
        <div className="sm:rounded-3xl sm:border sm:border-zinc-950/10 sm:bg-white/70 sm:p-10 lg:p-12 sm:dark:border-white/12 sm:dark:bg-white/[0.04]">
          {/* Centred intro, two-column body — the same shape the Services section uses. */}
          <header className="mx-auto max-w-2xl text-center">
            <p className={SECTION_EYEBROW}>{copy.eyebrow}</p>

            <h2
              id="contact-heading"
              className="mt-3 font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[48px]"
            >
              {copy.title}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-white/70 sm:text-lg">
              {copy.subtitle}
            </p>
          </header>

          {/*
          Two ways in, side by side rather than stacked: the address is the one
          that cannot break, the form is the one that costs least to use. Stacked,
          the form pushed the address far enough up the page to read as an
          afterthought.
        */}
          <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <p className="text-sm text-zinc-500 dark:text-white/50">
                {copy.direct_label}
              </p>

              {/*
              The address is readable text before it is anything else, so it
              survives a browser with no mail client — the failure this section
              exists for.
            */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={buildContactMailto(
                    EMAIL_LINK.href,
                    dict.navigation.contact_subject,
                    dict.navigation.contact_greeting,
                  )}
                  className="rounded-lg font-nohemi text-xl font-bold tracking-tight text-zinc-950 underline decoration-zinc-950/20 underline-offset-[6px] outline-none transition-colors hover:decoration-zinc-950/60 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70 dark:focus-visible:ring-white/35 sm:text-2xl"
                >
                  {address}
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copy.copy_label}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-950/12 px-3.5 py-1.5 text-[13px] text-zinc-700 outline-none transition-colors hover:border-zinc-950/25 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/15 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white dark:focus-visible:ring-white/35"
                >
                  <CopyIcon copied={status === "copied"} />
                  {/*
                  Hidden from the accessibility tree so the button's accessible
                  name stays put while the visible label changes; the live region
                  below announces the outcome instead.
                */}
                  <span aria-hidden>
                    {status === "copied"
                      ? copy.copied
                      : status === "failed"
                        ? copy.copy_failed
                        : copy.copy}
                  </span>
                </button>
              </div>

              {/* Sibling, not child: nested it would rewrite the button's name on every change. */}
              <span aria-live="polite" className="sr-only">
                {status === "copied" ? copy.copied : null}
                {status === "failed" ? copy.copy_failed : null}
              </span>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
