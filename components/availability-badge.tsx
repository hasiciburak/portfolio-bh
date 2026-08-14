"use client";

import { AVAILABILITY_STATUS } from "@/lib/availability-status";
import { useTranslation } from "@/components/language-provider";

/**
 * Availability, as a badge above the hero headline. It is the first thing a
 * recruiter screens on, so it belongs in the part of the page they see before
 * deciding whether to scroll at all.
 *
 * Carries the state and the city, and stops there. Work model was the third
 * qualifier and it is what tipped the pill from a label into a sentence — the
 * shape reads as one short fact, so it gets one.
 *
 * Solid surface rather than a hairline outline, for the same reason those pages
 * use one: a 13px badge sitting under a 96px headline needs weight to survive the
 * comparison, and an outlined pill at 3% fill simply gets flattened by it.
 */
export const AvailabilityBadge = ({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"p">) => {
  const { dict } = useTranslation();

  const status = dict.availability?.status || AVAILABILITY_STATUS.status;
  const location = dict.availability?.location || AVAILABILITY_STATUS.location;

  return (
    // `rest` carries the hero's `data-intro-rise` marker through to the DOM.
    <p className={className} {...rest}>
      <span className="inline-flex items-center gap-2.5 rounded-full border border-zinc-900/12 bg-white/80 px-3.5 py-2 text-[13px] leading-tight text-zinc-900 shadow-[0_6px_24px_rgb(15_23_42_/_0.07)] backdrop-blur-xl sm:text-sm dark:border-white/20 dark:bg-white/12 dark:text-white dark:shadow-[0_6px_24px_rgb(0_0_0_/_0.22)]">
        {/*
         * `animate-ping` under `motion-safe`, slowed from Tailwind's 1s — at the
         * default rate a 7px dot reads as an alert rather than a heartbeat.
         */}
        <span
          aria-hidden
          className="relative flex h-[7px] w-[7px] shrink-0 text-teal-600 dark:text-teal-400"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 motion-safe:animate-ping motion-safe:[animation-duration:2.4s]" />
          <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-current" />
        </span>

        {/* Gives a screen reader the context the dot carries visually. */}
        <span className="sr-only">{dict.availability?.label}: </span>
        <span className="font-medium">{status}</span>
        <span aria-hidden className="text-zinc-900/25 dark:text-white/30">
          ·
        </span>
        <span className="text-zinc-600 dark:text-white/65">{location}</span>
      </span>
    </p>
  );
};
