"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { SkillsetMarqueeRow } from "@/components/skillset-marquee";
import { SKILLSET_COLLABORATION, SKILLSET_ROWS } from "@/lib/skillset-data";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useTranslation } from "@/components/language-provider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MySkillsetSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();
  const { dict } = useTranslation();

  const rows = SKILLSET_ROWS.map((row) => {
    const key = row.id as keyof typeof dict.skillset.categories;
    return { ...row, title: dict.skillset.categories[key] || row.title };
  });

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const items = gsap.utils.toArray<HTMLElement>(
        ".skillset-stagger-item",
        root,
      );

      if (reduceMotion || !smootherReady) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(items, { opacity: 0, y: 18 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: "power2.out",
        stagger: 0.05,
        scrollTrigger: {
          trigger: root,
          start: "top 86%",
          once: true,
        },
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
      id="skillset"
      ref={sectionRef}
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="skillset-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
        {/* Title→subtitle and subtitle→rows use the same step at every breakpoint. */}
        <div className="skillset-stagger-item mb-4 flex flex-col items-center gap-4 text-center sm:mb-5 sm:gap-5 lg:mb-6 lg:gap-6">
          <h2
            id="skillset-heading"
            className="font-nohemi text-[34px] font-bold leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-[42px] lg:text-5xl"
          >
            {dict.skillset.title}
          </h2>
          {/* Flush left so the caption starts on the same edge as the row labels below it. */}
          <p className="max-w-[46ch] self-start text-left text-sm leading-snug text-zinc-500 dark:text-white/50 sm:text-base">
            {dict.skillset.subtitle}
          </p>
        </div>

        <div className="skillset-rows divide-y divide-zinc-200/70 dark:divide-white/[0.07]">
          {rows.map((row, index) => (
            <div key={row.id} className="skillset-stagger-item">
              <SkillsetMarqueeRow
                title={row.title}
                skills={row.skills}
                reverse={index % 2 === 1}
                reduceMotion={reduceMotion}
              />
            </div>
          ))}
        </div>

        <p className="skillset-stagger-item mt-6 text-[13px] leading-relaxed text-zinc-500 dark:text-white/45 sm:mt-7 sm:text-sm">
          <span className="text-zinc-600 dark:text-white/60">
            {dict.skillset.collaboration_label}
          </span>{" "}
          {SKILLSET_COLLABORATION.join(" · ")}
        </p>
      </div>
    </section>
  );
};

export default MySkillsetSection;
