"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type CSSProperties } from "react";

import { ServicesCursor } from "@/components/services-cursor";
import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { requestContactPrefill } from "@/lib/contact-prefill";
import { scrollToSectionId } from "@/lib/scroll-to-section";
import { SECTION_EYEBROW } from "@/lib/section-eyebrow";
import { SERVICE_OFFERINGS } from "@/lib/services";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useTranslation } from "@/components/language-provider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

/** Fills the one slot the service copy in the dictionaries leaves open. */
const withService = (template: string, service: string) =>
  template.replace("{service}", service);

const ArrowIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width={20}
    height={20}
    fill="none"
    className="services-card-arrow absolute right-4 top-4 lg:right-5 lg:top-5"
  >
    <path
      d="M7 17L17 7M17 7H9M17 7v8"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLOListElement>(null);
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
          <p className={SECTION_EYEBROW}>{dict.services.eyebrow}</p>
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
        <ol ref={deckRef} className="services-deck">
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
                  {/*
                    A link, not a button: the card's destination is the contact
                    section, which has a real `#contact` address — so a middle
                    click, a modified click and a screen reader's link list all
                    behave the way they should, and the handler below only takes
                    over the plain case it can improve on.

                    Named for what it does rather than by its contents, which as a
                    link would read as the whole card — number, copy and the
                    keyword list — before the visitor heard where it goes.
                  */}
                  {/* Lift, shadow and their timing live on `.services-card` in globals.css. */}
                  <a
                    href="#contact"
                    aria-label={withService(dict.services.card_cta, service.title)}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey ||
                        event.button !== 0
                      )
                        return;

                      event.preventDefault();

                      /*
                       * Scroll first, fill second. Filling the form puts focus in the
                       * textarea, and `focus({ preventScroll: true })` is the only
                       * thing keeping the browser from jumping the page to it — where
                       * that option is unsupported, or where anything else moves focus
                       * first, the jump lands before ScrollSmoother has started and the
                       * whole travel is lost. Started in this order there is nothing
                       * for the jump to skip.
                       */
                      scrollToSectionId("contact", reduceMotion);
                      requestContactPrefill(
                        withService(dict.contact.form_prefill, service.title),
                      );
                    }}
                    className="services-card flex gap-4 rounded-2xl border border-zinc-950/10 bg-linear-to-b from-white to-zinc-100 p-5 outline-none hover:border-zinc-950/20 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/12 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-white/25 dark:focus-visible:ring-white/35 lg:min-h-[248px] lg:flex-col lg:gap-0 lg:p-6 xl:min-h-[268px]"
                  >
                    <ArrowIcon />
                    {/* Colour and its hover state live on `.services-card-index` in globals.css. */}
                    <p
                      aria-hidden
                      className="services-card-index shrink-0 font-nohemi text-[32px] font-black leading-none tracking-tight lg:text-[60px] xl:text-[64px]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    {/*
                      `mt-auto` only bites once the card is a column: number pinned top,
                      copy bottom. The right padding is for the arrow, which on a phone
                      shares its line with the title; from `lg` the copy has dropped to
                      the foot of the card and the corner is clear again.
                    */}
                    <div className="min-w-0 pr-7 lg:mt-auto lg:pr-0 lg:pt-6">
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
                  </a>
                </div>
              </li>
            );
          })}
        </ol>

        <ServicesCursor deckRef={deckRef} label={dict.services.cursor_label} />
      </div>
    </section>
  );
};

export default ServicesSection;
