"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import { isNativeTouchScroll, useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { ProofMetrics } from "@/components/proof-metrics";
import { HIRE_ME_REASONS } from "@/lib/hire-me-reasons";
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

const WhyHireMeSection = () => {
  const pinRootRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();
  const { dict } = useTranslation();

  const reasons = HIRE_ME_REASONS.map((reason) => {
    const key = reason.id.replace("-", "_") as keyof typeof dict.why_hire_me.reasons;
    const localized = dict.why_hire_me.reasons[key] || reason;
    return {
      id: reason.id,
      title: localized.title,
      body: localized.body,
    };
  });

  useGSAP(
    () => {
      if (reduceMotion || !smootherReady || !pinRootRef.current) return;

      const root = pinRootRef.current;
      const panels = gsap.utils.toArray<HTMLElement>(".hire-me-panel", root);
      if (panels.length === 0) return;

      // Initial state: only the first panel visible. Setting all panels first so cleanup-rerun is idempotent.
      gsap.set(panels, { opacity: 0, y: 28 });
      gsap.set(panels[0], { opacity: 1, y: 0 });

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (ctx.conditions?.reduce) return;
          // Desktop gets a roomier scrub (≈0.9 viewport per transition); mobile shortens it for less thumb travel.
          const factor = ctx.conditions?.isDesktop ? 0.9 : 0.6;

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${window.innerHeight * (panels.length - 1) * factor}`,
              pin: true,
              pinSpacing: true,
              // "transform" is only needed because ScrollSmoother transforms
              // #smooth-content, and `position: fixed` resolves against a transformed
              // ancestor instead of the viewport. On touch that transform is gone
              // (smoothTouch: 0), so "fixed" is both correct and far cheaper: the
              // compositor holds the pin, rather than the main thread writing a new
              // matrix on every frame of an async, off-thread scroll — which is what
              // made this section judder worst of all on a phone.
              pinType: isNativeTouchScroll() ? "fixed" : "transform",
              anticipatePin: 1,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          for (let i = 1; i < panels.length; i++) {
            const t = i - 1;
            tl.to(panels[i - 1], { opacity: 0, y: -20, duration: 0.5 }, t).fromTo(
              panels[i],
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.5 },
              t,
            );
          }
        },
      );

      // Document height is only correct after pin spacers exist; refresh once they're registered.
      queueMicrotask(() => ScrollTrigger.refresh());

      return () => {
        mm.revert();
      };
    },
    {
      scope: pinRootRef,
      dependencies: [reduceMotion, smootherReady],
      revertOnUpdate: true,
    },
  );

  const handleImageLoaded = () => {
    ScrollTrigger.refresh();
  };

  const gridTemplate =
    "flex flex-col items-center gap-6 sm:gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:gap-16";

  const heading = (
    <h2
      id="why-hire-heading"
      className="mb-6 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:mb-10 sm:text-5xl lg:mb-14 lg:text-[64px]"
    >
      {dict.why_hire_me.title}
    </h2>
  );

  /*
   * The artwork is square, so capping its *width* in svh caps its height by the
   * same number — which is what keeps the pinned block inside one viewport on a
   * short phone. Below `lg` this column is stacked under the copy and is the one
   * piece that can afford to give height back.
   */
  const imageCol = (
    <div className="relative flex w-full max-w-[min(240px,30svh)] shrink-0 justify-center pointer-events-none sm:max-w-[min(320px,32svh)] lg:max-w-[445px] lg:justify-self-end">
      <Image
        src="/images/achievements.png"
        alt="Stylized 3D trophy, wrench, and gear on a pedestal"
        width={1024}
        height={1024}
        sizes="(max-width: 639px) 240px, (max-width: 1023px) 320px, 445px"
        className="h-auto w-full object-contain"
        priority={false}
        onLoad={handleImageLoaded}
      />
    </div>
  );

  return (
    <section
      id="why-hire"
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="why-hire-heading"
    >
      {/*
        Outside both branches below, and outside the pin in particular: the evidence
        scrolls past normally, then the argument pins behind it.
      */}
      <ProofMetrics />

      {reduceMotion ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
          {heading}
          <div className={gridTemplate}>
            <div className="flex w-full max-w-[660px] flex-col gap-12 lg:max-w-none lg:justify-self-start">
              {reasons.map((reason) => (
                <div key={reason.id} className="flex flex-col gap-2.5 text-left">
                  <h3 className="font-nohemi text-[28px] font-normal leading-[1.2] text-zinc-950 dark:text-white sm:text-4xl lg:text-[48px]">
                    {reason.title}
                  </h3>
                  <p className="max-w-[660px] text-base leading-[1.25] text-zinc-600 dark:text-white/80 sm:text-lg lg:text-xl lg:leading-[1.2]">
                    {reason.body}
                  </p>
                </div>
              ))}
            </div>
            {imageCol}
          </div>
        </div>
      ) : (
        // Pin the whole block (heading + reasons + image). Heading + trophy stay; reason text scrubs through.
        /*
         * The pin parks this block at `top: top`, so unlike every other section it
         * cannot simply scroll out from under the fixed header — whatever lands in
         * the top 80px stays there for the whole scrub. Hence a top pad that clears
         * the header with room to spare, and `justify-center-safe` so that a
         * viewport too short for the content spills off the bottom instead of
         * centring the heading back up underneath the wordmark. `lg` keeps the
         * original 80px: the desktop layout fills an 800px viewport exactly, so
         * extra padding there would start clipping instead of buying air.
         */
        <article
          ref={pinRootRef}
          className="relative z-[1] mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center-safe bg-zinc-50 px-4 pb-12 pt-24 sm:pb-16 dark:bg-zinc-950 lg:pb-20 lg:pt-20"
        >
          {heading}
          <div className={gridTemplate}>
            {/*
              The panels are stacked in one grid cell rather than absolutely
              positioned, so the column is exactly as tall as the tallest reason at
              the current width and language. The fixed `min-h` this replaced was
              sized for the longest Turkish string and wasted ~110px of the mobile
              viewport on the English copy — which is what pushed the heading up
              into the header in the first place.
            */}
            <div className="grid w-full max-w-[660px] lg:min-h-[260px] lg:max-w-none lg:justify-self-start">
              {reasons.map((reason) => (
                <div
                  key={reason.id}
                  className="hire-me-panel col-start-1 row-start-1 flex flex-col gap-2.5 text-left"
                >
                  <h3 className="font-nohemi text-[28px] font-normal leading-[1.2] text-zinc-950 dark:text-white sm:text-4xl lg:text-[48px]">
                    {reason.title}
                  </h3>
                  <p className="max-w-[660px] text-base leading-[1.25] text-zinc-600 dark:text-white/80 sm:text-lg lg:text-xl lg:leading-[1.2]">
                    {reason.body}
                  </p>
                </div>
              ))}
            </div>
            {imageCol}
          </div>
        </article>
      )}
    </section>
  );
};

export default WhyHireMeSection;

