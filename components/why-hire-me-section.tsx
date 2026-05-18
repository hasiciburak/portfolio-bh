"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { HIRE_ME_REASONS } from "@/lib/hire-me-reasons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function usePrefersReducedMotion(): boolean {
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

export default function WhyHireMeSection() {
  const pinRootRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();

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
              // pinType: "transform" plays nice with ScrollSmoother's transformed #smooth-content.
              pinType: "transform",
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
    "flex flex-col items-center gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:gap-16";

  const heading = (
    <h2
      id="why-hire-heading"
      className="mb-10 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-white sm:mb-12 sm:text-5xl lg:mb-14 lg:text-[64px]"
    >
      Why Hire Me?
    </h2>
  );

  const imageCol = (
    <div className="relative flex w-full max-w-[320px] shrink-0 justify-center pointer-events-none sm:max-w-[380px] lg:max-w-[445px] lg:justify-self-end">
      <Image
        src="/images/achievements.png"
        alt="Stylized 3D trophy, wrench, and gear on a pedestal"
        width={1024}
        height={1024}
        sizes="(max-width: 1024px) 320px, 445px"
        className="h-auto w-full object-contain"
        priority={false}
        onLoad={handleImageLoaded}
      />
    </div>
  );

  return (
    <section
      id="why-hire"
      className="isolate w-full scroll-mt-24 bg-zinc-950 font-sans text-white"
      aria-labelledby="why-hire-heading"
    >
      {reduceMotion ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
          {heading}
          <div className={gridTemplate}>
            <div className="flex w-full max-w-[660px] flex-col gap-12 lg:max-w-none lg:justify-self-start">
              {HIRE_ME_REASONS.map((reason) => (
                <div key={reason.id} className="flex flex-col gap-2.5 text-left">
                  <h3 className="font-nohemi text-[28px] font-normal leading-[1.2] text-white sm:text-4xl lg:text-[48px]">
                    {reason.title}
                  </h3>
                  <p className="max-w-[660px] text-base leading-[1.25] text-white/80 sm:text-lg lg:text-xl lg:leading-[1.2]">
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
        <article
          ref={pinRootRef}
          className="relative z-[1] mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center bg-zinc-950 px-4 py-12 sm:py-16 lg:py-20"
        >
          {heading}
          <div className={gridTemplate}>
            <div className="relative w-full max-w-[660px] min-h-[280px] sm:min-h-[260px] lg:min-h-[260px] lg:max-w-none lg:justify-self-start">
              {HIRE_ME_REASONS.map((reason) => (
                <div
                  key={reason.id}
                  className="hire-me-panel absolute inset-x-0 top-0 flex flex-col gap-2.5 text-left"
                >
                  <h3 className="font-nohemi text-[28px] font-normal leading-[1.2] text-white sm:text-4xl lg:text-[48px]">
                    {reason.title}
                  </h3>
                  <p className="max-w-[660px] text-base leading-[1.25] text-white/80 sm:text-lg lg:text-xl lg:leading-[1.2]">
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
}
