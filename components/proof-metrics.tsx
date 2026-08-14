"use client";

import { PROOF_METRICS } from "@/lib/proof-metrics";
import { useTranslation } from "@/components/language-provider";

/**
 * The four numbers, as the opening line of "Why Hire Me" rather than a band of
 * their own.
 *
 * It has been both before. As a standalone `<section>` with `border-y` it read as
 * a third stacked stripe under the hero; moved inside the hero it crowded a column
 * that already carried a badge, a headline, a bio and a CTA. Parented to the
 * section it introduces — no border, no background of its own — it reads as that
 * section's lead-in: the evidence, immediately before the argument it supports.
 *
 * Deliberately outside the pinned `<article>`. That block is `min-h-[100svh]` and
 * the desktop layout fills an 800px viewport exactly, so anything added inside it
 * comes straight out of the pinned scrub's headroom.
 */
export const ProofMetrics = () => {
  const { dict } = useTranslation();

  const metrics = PROOF_METRICS.map((metric) => {
    const key = metric.id as keyof typeof dict.proof.metrics;
    const localized = dict.proof.metrics[key];
    return {
      id: metric.id,
      value: localized?.value || metric.value,
      label: localized?.label || metric.label,
    };
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-14 sm:pt-16 lg:pt-20">
      <h2 className="sr-only">{dict.proof.title}</h2>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8">
        {metrics.map((metric) => (
          /*
           * Reversed so `dl` order stays label-then-figure for a screen reader
           * while the eye gets the figure first; `justify-end` is the visual top
           * on the flipped axis, which keeps the figures on one shared line
           * instead of letting uneven label heights ripple through them.
           */
          <div
            key={metric.id}
            className="flex flex-col-reverse justify-end gap-2 border-t border-zinc-900/12 pt-3 dark:border-white/15"
          >
            <dt className="max-w-[34ch] text-[13px] leading-snug text-zinc-500 dark:text-white/50 sm:text-sm">
              {metric.label}
            </dt>
            <dd className="font-nohemi text-[32px] font-bold leading-none tracking-tight text-zinc-950 dark:text-white sm:text-[38px] lg:text-[44px]">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
