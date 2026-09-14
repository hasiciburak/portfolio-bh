"use client";

import { getCalApi } from "@calcom/embed-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

import { GlassSurface } from "@/components/glass-surface";
import { useTranslation } from "@/components/language-provider";
import { CAL_BOOKING_URL, CAL_LINK, CAL_NAMESPACE } from "@/lib/cal";

/** Modal layout, shared by the declarative attribute and the programmatic open. */
const CAL_MODAL_CONFIG = { layout: "month_view" } as const;

/**
 * Layout only. Theme must not live on this attribute: `resolvedTheme` is
 * unknown on the server and known on the client, so putting it here is a
 * hydration mismatch. The modal theme is applied after mount via `cal("ui")`.
 */
const CAL_CONFIG = JSON.stringify(CAL_MODAL_CONFIG);

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

type CalApi = Awaited<ReturnType<typeof getCalApi>>;

const applyTheme = (cal: CalApi, theme: "dark" | "light") => {
  cal("ui", {
    theme,
    hideEventTypeDetails: false,
    cssVarsPerTheme: {
      light: { "cal-brand": "#09090b" },
      dark: { "cal-brand": "#fafafa" },
    },
  });
};

/**
 * Opens the 30-minute Cal.com event in a modal, and keeps a real URL underneath
 * so a visitor without JS still lands on the booking page.
 *
 * Popup rather than an inline calendar: the contact panel is already a tight
 * two-column layout, and an embedded month view would fight both that geometry
 * and ScrollSmoother. Theme is read from next-themes, not Cal's `auto`, because
 * `auto` follows the OS and this site can disagree with the OS.
 *
 * The embed script is fetched on first intent (hover, focus, touch) rather than
 * on mount. `embed.js` is the page's only third-party request and it sets a
 * Cloudflare cookie the moment it loads, which Lighthouse scored against the
 * whole site for a button most visitors never reach. If a click lands before
 * the script has arrived, the handler holds the navigation and opens the modal
 * itself once it has; after that Cal's own `data-cal-link` listener takes over.
 */
export const BookCallButton = () => {
  const { dict } = useTranslation();
  const { resolvedTheme } = useTheme();
  const copy = dict.contact;
  const theme: "dark" | "light" = resolvedTheme === "dark" ? "dark" : "light";

  const calRef = useRef<CalApi | null>(null);
  const loadRef = useRef<Promise<CalApi> | null>(null);
  /* The theme the load path applies; kept current by the effect below. */
  const themeRef = useRef(theme);

  /* Idempotent: every intent event funnels into one in-flight load. */
  const load = useCallback(() => {
    if (!loadRef.current) {
      loadRef.current = getCalApi({ namespace: CAL_NAMESPACE }).then((cal) => {
        applyTheme(cal, themeRef.current);
        calRef.current = cal;
        return cal;
      });
    }
    return loadRef.current;
  }, []);

  /* Theme toggled after the embed arrived: re-apply, otherwise nothing to do. */
  useEffect(() => {
    themeRef.current = theme;
    if (calRef.current) applyTheme(calRef.current, theme);
  }, [theme]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Loaded: Cal's document-level listener opens the modal and cancels the
    // navigation itself.
    if (calRef.current) return;

    event.preventDefault();
    void load().then((cal) => {
      cal("modal", { calLink: CAL_LINK, config: CAL_MODAL_CONFIG });
    });
  };

  return (
    <div className="mt-8">
      <p className="text-sm text-zinc-500 dark:text-white/50">{copy.book_label}</p>

      {/*
        The same quiet glass capsule as the hero's secondary CTA — this is the
        secondary action of the contact panel, under the form. The capsule owns
        the fill and rim; the anchor stays the Cal.com target with its
        `data-cal-*` attributes, so the embed's document-level click listener
        still finds it.
      */}
      <GlassSurface tone="quiet" className="mt-3 rounded-full">
        <a
          href={CAL_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cal-namespace={CAL_NAMESPACE}
          data-cal-link={CAL_LINK}
          data-cal-config={CAL_CONFIG}
          onPointerEnter={load}
          onFocus={load}
          onTouchStart={load}
          onClick={handleClick}
          className="group/book inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] text-zinc-800 outline-none transition-colors hover:bg-white/30 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/80 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/35"
        >
          <CalendarIcon className="shrink-0 text-zinc-500 transition-colors group-hover/book:text-zinc-800 dark:text-white/55 dark:group-hover/book:text-white" />
          {copy.book_cta}
        </a>
      </GlassSurface>
    </div>
  );
};
