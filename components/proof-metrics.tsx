"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { PROOF_METRICS } from "@/lib/proof-metrics";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useTranslation } from "@/components/language-provider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Splits a figure into the part that counts and the parts that don't.
 *
 * The affix cannot be assumed to trail the number: English writes `80%`, Turkish
 * writes `%80`. Capturing both sides keeps the count working in either, and the
 * lazy leading group stops `%` being swallowed into the number.
 *
 * Only whole numbers animate. `5 dk`, `100`, `%80` and `2×` all qualify today;
 * anything with a decimal falls through and renders as written rather than
 * counting through a separator that differs per locale.
 */
const FIGURE = /^(\D*?)(\d+)(\D*)$/;

const splitFigure = (value: string) => {
  const match = FIGURE.exec(value);
  if (!match) return null;
  return { prefix: match[1], count: match[2], suffix: match[3] };
};

export const ProofMetrics = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();
  const { dict } = useTranslation();

  const metrics = PROOF_METRICS.map((metric) => {
    const key = metric.id as keyof typeof dict.proof.metrics;
    const localized = dict.proof.metrics[key];
    const value = localized?.value || metric.value;
    return {
      id: metric.id,
      value,
      figure: splitFigure(value),
      label: localized?.label || metric.label,
    };
  });

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const counters = gsap.utils.toArray<HTMLElement>("[data-count]", root);
      if (counters.length === 0) return;

      /*
       * Server-rendered markup already carries the final figure, so a visitor who
       * never gets this effect — no JS, reduced motion — reads the real number.
       * Zeroing happens here, inside useGSAP's layout-effect pass, which lands
       * before paint: the reset is never visible as a flash.
       */
      if (reduceMotion || !smootherReady) return;

      counters.forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;

        const tally = { value: 0 };
        el.textContent = "0";

        gsap.to(tally, {
          value: target,
          duration: 1.1,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = String(Math.round(tally.value));
          },
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });
      });
    },
    {
      scope: rootRef,
      dependencies: [reduceMotion, smootherReady],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-7xl px-4 pt-14 sm:pt-16 lg:pt-20"
    >
      {/*
        An eyebrow rather than a heading, matching the Services section's. A full
        heading here would sit a few hundred pixels above the 64px "Why Hire Me"
        and the two would compete; at eyebrow weight it labels the numbers without
        claiming to open a section of its own.
      */}
      <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-white/45 sm:mb-7 sm:text-sm">
        {dict.proof.title}
      </h2>

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
            {/*
              Stops short of the 64px "Why Hire Me" heading below on purpose —
              these are the section's evidence, not a second title competing with
              the one it introduces.
            */}
            <dd className="font-nohemi text-[38px] font-bold leading-none tracking-tight tabular-nums text-zinc-950 dark:text-white sm:text-[46px] lg:text-[56px]">
              {metric.figure ? (
                <>
                  {/*
                    The visible figure mutates every frame while counting, which
                    is not something to read out. Assistive tech gets the settled
                    value once, from a node nothing touches.
                  */}
                  <span className="sr-only">{metric.value}</span>
                  <span aria-hidden>
                    {metric.figure.prefix}
                    <span data-count={metric.figure.count}>
                      {metric.figure.count}
                    </span>
                    {metric.figure.suffix}
                  </span>
                </>
              ) : (
                metric.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
