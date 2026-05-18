"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";

import { useSmoothScrollReady } from "@/components/smooth-scroll-provider";
import { SkillsetChip } from "@/components/skillset-chip";
import { SKILLSET_CATEGORIES } from "@/lib/skillset-data";

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

export default function MySkillsetSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const smootherReady = useSmoothScrollReady();

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
        stagger: 0.035,
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
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
        <h2
          id="skillset-heading"
          className="skillset-stagger-item mb-12 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:mb-14 sm:text-5xl lg:mb-16 lg:text-[64px]"
        >
          My Skillset
        </h2>

        <div className="flex flex-col gap-14 lg:gap-16">
          {SKILLSET_CATEGORIES.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`skillset-cat-${category.id}`}
            >
              <h3
                id={`skillset-cat-${category.id}`}
                className="skillset-stagger-item mb-5 font-nohemi text-xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl"
              >
                {category.title}
              </h3>
              <ul
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                role="list"
              >
                {category.skills.map((skill) => (
                  <li
                    key={`${category.id}-${skill.name}`}
                    className="skillset-stagger-item"
                  >
                    <SkillsetChip skill={skill} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
