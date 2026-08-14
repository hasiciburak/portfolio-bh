"use client";

import { Fragment } from "react";

import { AVAILABILITY_STATUS } from "@/lib/availability-status";
import { useTranslation } from "@/components/language-provider";

/**
 * Availability, as a line above the hero headline rather than a section further
 * down. It is the first thing a recruiter screens on, so it belongs in the part of
 * the page they see before deciding whether to scroll at all.
 *
 * The qualifiers drop below `sm`: at 375px the full string wraps to three lines
 * and stops reading as a pill. The state itself — the part that decides whether
 * anyone reads on — survives at every width.
 */
export const AvailabilityBadge = ({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"p">) => {
  const { dict } = useTranslation();

  const status = dict.availability?.status || AVAILABILITY_STATUS.status;
  const meta = dict.availability?.meta || AVAILABILITY_STATUS.meta;

  return (
    // `rest` carries the hero's `data-intro-rise` marker through to the DOM.
    <p className={className} {...rest}>
      <span className="inline-flex items-center gap-2.5 rounded-full border border-zinc-950/12 bg-zinc-950/[0.035] px-3.5 py-1.5 text-[13px] leading-tight text-zinc-700 backdrop-blur-sm sm:text-sm dark:border-white/15 dark:bg-white/[0.07] dark:text-white/80">
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
        <span className="font-medium text-zinc-900 dark:text-white">
          {status}
        </span>

        {meta.length > 0 ? (
          <span className="max-sm:hidden">
            {meta.map((item) => (
              <Fragment key={item}>
                <span aria-hidden className="px-2 text-zinc-950/25 dark:text-white/30">
                  ·
                </span>
                {item}
              </Fragment>
            ))}
          </span>
        ) : null}
      </span>
    </p>
  );
};
