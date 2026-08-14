"use client";

import {
  AVAILABILITY_ROWS,
  AVAILABILITY_STATUS_ROW_ID,
} from "@/lib/availability-status";
import { useTranslation } from "@/components/language-provider";

/**
 * Availability, borrowed from the service status page.
 *
 * Half the people reading this site are engineers and the other half screen on
 * exactly these three facts, and a status board is the one layout both parse
 * without being taught it: monospaced label/value rows and a live dot on the only
 * row that has a state. It also says the thing a portfolio usually leaves a
 * recruiter to guess at, in the register the rest of the site already speaks.
 *
 * Sits above the proof strip on purpose — availability gates everything, so it is
 * the question to answer before the numbers make their case.
 */
const AvailabilityStatusSection = () => {
  const { dict } = useTranslation();

  const rows = AVAILABILITY_ROWS.map((row) => {
    const key = row.id as keyof typeof dict.availability.rows;
    const localized = dict.availability.rows[key];
    return {
      id: row.id,
      label: localized?.label || row.label,
      value: localized?.value || row.value,
    };
  });

  return (
    <section
      id="availability"
      aria-labelledby="availability-heading"
      className="w-full scroll-mt-24 border-t border-zinc-900/[0.08] bg-zinc-50 font-sans text-zinc-950 dark:border-white/12 dark:bg-zinc-950 dark:text-white"
    >
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-12 lg:py-14">
        <h2 id="availability-heading" className="sr-only">
          {dict.availability.title}
        </h2>

        <dl className="divide-y divide-zinc-900/[0.08] border-y border-zinc-900/[0.08] dark:divide-white/10 dark:border-white/10">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-baseline justify-between gap-4 py-3 sm:gap-6 sm:py-3.5"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 dark:text-white/45 sm:text-[11px]">
                {row.label}
              </dt>
              <dd className="flex items-baseline gap-2.5 text-right font-mono text-[13px] text-zinc-950 dark:text-white sm:text-sm">
                {row.id === AVAILABILITY_STATUS_ROW_ID ? (
                  /*
                   * `animate-ping` under `motion-safe` rather than a hand-rolled
                   * keyframe, and slowed from Tailwind's 1s — at the default rate a
                   * 10px dot reads as an alert rather than a heartbeat.
                   */
                  <span
                    aria-hidden
                    className="relative flex h-2.5 w-2.5 shrink-0 translate-y-[-1px] self-center text-teal-500 dark:text-teal-400"
                  >
                    <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 motion-safe:animate-ping motion-safe:[animation-duration:2.4s]" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
                  </span>
                ) : null}
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-center font-mono text-[11px] leading-relaxed text-zinc-500 dark:text-white/45 sm:text-xs">
          {dict.availability.note}
        </p>
      </div>
    </section>
  );
};

export default AvailabilityStatusSection;
