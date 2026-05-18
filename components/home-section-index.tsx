"use client";

import {
  HOME_SECTION_INDEX_ENTRIES,
  type HomeSectionIndexId,
} from "@/lib/home-section-index";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

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

function scrollToSectionId(id: HomeSectionIndexId, prefersReducedMotion: boolean) {
  const el = document.getElementById(id);
  if (!el) return;

  const smoother = ScrollSmoother.get();
  if (smoother && !prefersReducedMotion) {
    smoother.scrollTo(`#${id}`, true, "top top");
    return;
  }

  el.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export function HomeSectionIndex() {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<HomeSectionIndexId>(
    HOME_SECTION_INDEX_ENTRIES[0].id,
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const updateActive = useCallback(() => {
    if (typeof document === "undefined") return;

    const vh = window.innerHeight;
    const probe = Math.min(vh * 0.38, vh - 32);

    let found: HomeSectionIndexId = HOME_SECTION_INDEX_ENTRIES[0].id;
    let anyContains = false;

    for (const entry of HOME_SECTION_INDEX_ENTRIES) {
      const section = document.getElementById(entry.id);
      if (!section) continue;
      const { top, bottom } = section.getBoundingClientRect();
      if (top <= probe && bottom > probe) {
        found = entry.id;
        anyContains = true;
      }
    }

    if (!anyContains) {
      for (const entry of HOME_SECTION_INDEX_ENTRIES) {
        const section = document.getElementById(entry.id);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= probe) {
          found = entry.id;
        }
      }
    }

    setActiveId((prev) => (prev === found ? prev : found));
  }, []);

  useLayoutEffect(() => {
    if (pathname !== "/") return undefined;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateActive());
    };

    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    ScrollTrigger.addEventListener("scrollStart", schedule);
    ScrollTrigger.addEventListener("scrollEnd", schedule);
    ScrollTrigger.addEventListener("refresh", schedule);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ScrollTrigger.removeEventListener("scrollStart", schedule);
      ScrollTrigger.removeEventListener("scrollEnd", schedule);
      ScrollTrigger.removeEventListener("refresh", schedule);
    };
  }, [pathname, updateActive]);

  if (!mounted || pathname !== "/") return null;

  const rail = (
    <div className="pointer-events-none fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 lg:flex xl:right-8">
      <nav
        aria-label="On this page"
        className="pointer-events-auto flex flex-col items-end gap-3"
      >
        {HOME_SECTION_INDEX_ENTRIES.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <div key={id} className="group relative flex items-center">
              <span
                className={[
                  "pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-[0_10px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-opacity",
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                ].join(" ")}
              >
                {label}
              </span>
              <button
                type="button"
                aria-label={`Scroll to ${label}`}
                aria-current={isActive ? "location" : undefined}
                title={label}
                onClick={() => scrollToSectionId(id, prefersReducedMotion)}
                className={[
                  "relative size-3 rounded-full border transition-[box-shadow,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                  isActive
                    ? "border-white bg-white shadow-[0_0_14px_rgba(255,255,255,0.5)]"
                    : "border-white/45 bg-transparent hover:border-white/70 hover:bg-white/15",
                ].join(" ")}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );

  return createPortal(rail, document.body);
}
