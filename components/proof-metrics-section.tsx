"use client";

import { PROOF_METRICS } from "@/lib/proof-metrics";
import { useTranslation } from "@/components/language-provider";

/**
 * A band, not a section: it sits directly under the hero to put the four numbers
 * the CV can back up in front of someone who is skimming, before they decide
 * whether to keep scrolling. That is also why nothing here animates in — every
 * other home section reveals on scroll, but a proof strip that fades in is a proof
 * strip a fast scroller reads as empty space.
 *
 * The heading is visually hidden for the same reason. The landmark needs a label,
 * but a fifth centred section title would give a thin band the weight of a full
 * section and push the real content further down.
 */
const ProofMetricsSection = () => {
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
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className="w-full scroll-mt-24 border-y border-zinc-900/[0.08] bg-zinc-50 font-sans text-zinc-950 dark:border-white/12 dark:bg-zinc-950 dark:text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-12 lg:py-14">
        <h2 id="proof-heading" className="sr-only">
          {dict.proof.title}
        </h2>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {metrics.map((metric) => (
            /*
             * `dl` semantics put the label first and the figure second, so the
             * column is reversed rather than reordered: a screen reader hears
             * "Lighthouse performance score — 100" while the eye still gets the
             * number on top.
             *
             * That reversal also flips the main axis, which makes `justify-end`
             * the visual top. Without it the column packs downward and the labels
             * — two lines in English, three in Turkish — align at their baseline,
             * leaving the figures on a ragged line. The figures are what gets
             * scanned, so they get the shared edge.
             */
            <div
              key={metric.id}
              className="flex flex-col-reverse justify-end gap-2"
            >
              <dt className="max-w-[32ch] text-sm leading-snug text-zinc-600 dark:text-white/65 sm:text-[15px]">
                {metric.label}
              </dt>
              <dd className="font-nohemi text-[38px] font-bold leading-none tracking-tight text-zinc-950 dark:text-white sm:text-[44px] lg:text-5xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default ProofMetricsSection;
