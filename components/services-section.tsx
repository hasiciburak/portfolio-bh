"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { SERVICE_OFFERINGS } from "@/lib/services";
import { useTranslation } from "@/components/language-provider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const usePrefersReducedMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}

/**
 * Desktop scatter, one entry per card. `x` is a percentage of the deck's width and the
 * card is centred on it, so the fan reflows with the container instead of needing a
 * hand-tuned position per breakpoint; `y` is a fixed offset, because the deck's height is
 * fixed too (see `.services-deck` in globals.css).
 *
 * Only cards sharing a column can collide — 1/4, 2/5, 3/6 — and the rows are spaced to
 * leave at least ~45px under the taller card at both desktop widths in both languages.
 * Cards are sized by their copy, not to a fixed height, so that clearance is the whole
 * defence against a wrapped Turkish title landing on the card below it.
 */
const DECK_SLOTS = [
  { x: "17%", y: 0, rotate: -3 },
  { x: "50%", y: 48, rotate: 2 },
  { x: "83%", y: 16, rotate: -1.5 },
  { x: "17%", y: 360, rotate: 2.5 },
  { x: "50%", y: 408, rotate: -2 },
  { x: "83%", y: 376, rotate: 1.5 },
];

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();
  const { dict } = useTranslation();

  const services = SERVICE_OFFERINGS.map((service) => {
    const key = service.id as keyof typeof dict.services.offerings;
    const localized = dict.services.offerings[key];
    return {
      ...service,
      title: localized?.title || service.title,
      body: localized?.body || service.body,
    };
  });

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const header = root.querySelector<HTMLElement>(".services-reveal");
      const cards = gsap.utils.toArray<HTMLElement>(".services-card-reveal", root);
      const revealed = [header, ...cards].filter(Boolean) as HTMLElement[];

      if (reduceMotion || !smootherReady) {
        gsap.set(revealed, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(revealed, { opacity: 0, y: 34 });

      if (header) {
        gsap.to(header, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      }

      /*
       * A card deals in off its own position rather than off a stagger on the section.
       * The deck is ~760px tall, so a single section-level trigger fires while the lower
       * row is still below the fold — those three cards would finish animating unseen.
       * The scatter supplies the stagger for free: cards sit at six different heights, so
       * they cross the same trigger line at six different moments.
       */
      cards.forEach((card) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
      });

      queueMicrotask(() => ScrollTrigger.refresh());
    },
    {
      scope: sectionRef,
      dependencies: [reduceMotion, smootherReady],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      id="services"
      ref={sectionRef}
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
        {/* Centred to match the other home sections — Why Hire Me, Skillset and Work
            Experience all centre their headings, and this was the only one that did not. */}
        <header className="services-reveal mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-white/45 sm:text-sm">
            {dict.services.eyebrow}
          </p>
          <h2
            id="services-heading"
            className="mt-3 font-nohemi text-[34px] font-bold leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-[42px] lg:text-5xl"
          >
            {dict.services.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[60ch] text-base leading-relaxed text-zinc-600 dark:text-white/70 sm:text-lg">
            {dict.services.subtitle}
          </p>
        </header>

        {/* An ordered list, so the printed 01–06 can stay decorative for a screen reader. */}
        <ol className="services-deck">
          {services.map((service, index) => {
            const slot = DECK_SLOTS[index % DECK_SLOTS.length];

            return (
              <li
                key={service.id}
                className="services-slot"
                style={
                  {
                    "--deck-x": slot.x,
                    "--deck-y": `${slot.y}px`,
                    "--deck-rot": `${slot.rotate}deg`,
                  } as CSSProperties
                }
              >
                {/*
                  Three layers, because each owns a transform that must not be clobbered
                  by the next: the slot places and tilts the card, this wrapper is what
                  GSAP animates, and the card itself lifts on hover from CSS — which an
                  inline transform written by GSAP would otherwise outrank.
                */}
                <div className="services-card-reveal">
                  {/* Lift, shadow and their timing live on `.services-card` in globals.css. */}
                  <article className="services-card flex gap-4 rounded-2xl border border-zinc-950/10 bg-linear-to-b from-white to-zinc-100 p-5 hover:border-zinc-950/20 dark:border-white/12 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-white/25 lg:min-h-[248px] lg:flex-col lg:gap-0 lg:p-6 xl:min-h-[268px]">
                    <p
                      aria-hidden
                      className="shrink-0 font-nohemi text-[32px] font-black leading-none tracking-tight text-zinc-950/15 dark:text-white/15 lg:text-[60px] xl:text-[64px]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    {/* `mt-auto` only bites once the card is a column: number pinned top, copy bottom. */}
                    <div className="min-w-0 lg:mt-auto lg:pt-6">
                      <h3 className="font-nohemi text-lg font-bold leading-[1.2] text-zinc-950 dark:text-white sm:text-xl xl:text-[22px]">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.5] text-zinc-600 dark:text-white/65 xl:text-[15px]">
                        {service.body}
                      </p>
                      <p className="mt-3.5 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-white/45">
                        {service.keywords.join(" · ")}
                      </p>
                    </div>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default ServicesSection;
