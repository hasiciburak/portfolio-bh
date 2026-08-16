"use client";

import { getCalApi } from "@calcom/embed-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useTranslation } from "@/components/language-provider";
import { CAL_BOOKING_URL, CAL_LINK, CAL_NAMESPACE } from "@/lib/cal";

/**
 * Layout only. Theme must not live on this attribute: `resolvedTheme` is
 * unknown on the server and known on the client, so putting it here is a
 * hydration mismatch. The modal theme is applied after mount via `cal("ui")`.
 */
const CAL_CONFIG = JSON.stringify({ layout: "month_view" });

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <rect
      x={4}
      y={5}
      width={16}
      height={16}
      rx={2}
      stroke="currentColor"
      strokeWidth={1.75}
    />
    <path
      d="M8 3.5v3M16 3.5v3M4 10h16"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Opens the 30-minute Cal.com event in a modal, and keeps a real URL underneath
 * so a visitor without JS still lands on the booking page.
 *
 * Popup rather than an inline calendar: the contact panel is already a tight
 * two-column layout, and an embedded month view would fight both that geometry
 * and ScrollSmoother. Theme is read from next-themes, not Cal's `auto`, because
 * `auto` follows the OS and this site can disagree with the OS.
 */
export const BookCallButton = () => {
  const { dict } = useTranslation();
  const { resolvedTheme } = useTheme();
  const copy = dict.contact;
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;

      cal("ui", {
        theme,
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          light: { "cal-brand": "#09090b" },
          dark: { "cal-brand": "#fafafa" },
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <div className="mt-8">
      <p className="text-sm text-zinc-500 dark:text-white/50">{copy.book_label}</p>

      <a
        href={CAL_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-cal-namespace={CAL_NAMESPACE}
        data-cal-link={CAL_LINK}
        data-cal-config={CAL_CONFIG}
        className="group/book mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-950/12 px-4 py-2.5 text-[15px] text-zinc-800 outline-none transition-colors hover:border-zinc-950/25 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/15 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white dark:focus-visible:ring-white/35"
      >
        <CalendarIcon className="shrink-0 text-zinc-500 transition-colors group-hover/book:text-zinc-800 dark:text-white/55 dark:group-hover/book:text-white" />
        {copy.book_cta}
      </a>
    </div>
  );
};
