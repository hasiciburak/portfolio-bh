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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useDesktopViewport } from "@/lib/use-desktop-viewport";

gsap.registerPlugin(ScrollTrigger);

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

const scrollToSectionId = (id: HomeSectionIndexId, prefersReducedMotion: boolean) => {
  const el = document.getElementById(id);
  if (!el) return;

  const smoother = ScrollSmoother.get();
  if (smoother && !prefersReducedMotion) {
    // scrollTo() lands the section flush against the viewport top, which puts its
    // heading under the fixed header. scrollIntoView() below avoids that via the
    // sections' `scroll-mt-24`; read the same value back so both paths agree.
    const offset = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    smoother.scrollTo(el, true, `top ${offset}px`);
    return;
  }

  el.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export const HomeSectionIndex = () => {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useDesktopViewport();
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<HomeSectionIndexId>(
    HOME_SECTION_INDEX_ENTRIES[0].id,
  );
  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const updateActive = useCallback(() => {
    if (typeof document === "undefined") return;

    const vh = window.innerHeight;
    const probe = Math.min(vh * 0.38, vh - 32);

    // Runs every frame, so bail on the cheap when the page has not moved: one rect
    // read decides whether the five-section sweep below is worth doing at all.
    const anchor = document.getElementById(HOME_SECTION_INDEX_ENTRIES[0].id);
    const signature = anchor ? `${anchor.getBoundingClientRect().top}:${vh}` : null;
    if (signature !== null && signature === lastSignature.current) return;
    lastSignature.current = signature;

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

    // The page runs out of scroll before the final section can reach the probe line,
    // so on its own it would never light up — not even when its own dot is clicked.
    // Having it fully in view is as far as the page goes; count that as arriving.
    const last = HOME_SECTION_INDEX_ENTRIES[HOME_SECTION_INDEX_ENTRIES.length - 1];
    const lastSection = document.getElementById(last.id);
    if (lastSection && lastSection.getBoundingClientRect().bottom <= vh) {
      found = last.id;
    }

    setActiveId((prev) => (prev === found ? prev : found));
  }, []);

  useLayoutEffect(() => {
    // The rail is `hidden lg:flex`. Below `lg` this swept every section's rect on
    // GSAP's ticker to light up a dot that was never painted.
    if (pathname !== "/" || !isDesktop) return undefined;

    // A resize or a ScrollTrigger refresh can reflow the sections without moving the
    // first one, which the signature check would read as "nothing happened".
    const forceUpdate = () => {
      lastSignature.current = null;
      updateActive();
    };

    forceUpdate();

    // GSAP's ticker rather than `scroll`: ScrollSmoother keeps easing its transform
    // after native scroll events stop, so a scroll-driven marker settles on whichever
    // section happened to be under the probe when the events dried up — one behind.
    gsap.ticker.add(updateActive);
    window.addEventListener("resize", forceUpdate, { passive: true });
    ScrollTrigger.addEventListener("refresh", forceUpdate);

    return () => {
      gsap.ticker.remove(updateActive);
      window.removeEventListener("resize", forceUpdate);
      ScrollTrigger.removeEventListener("refresh", forceUpdate);
    };
  }, [pathname, updateActive, isDesktop]);

  if (!mounted || pathname !== "/" || !isDesktop) return null;

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
                  "pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-zinc-300/95 bg-white/92 px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-[0_10px_40px_rgb(15_23_42_/_0.1),inset_0_1px_0_rgb(255_255_255_/_0.92)] backdrop-blur-xl backdrop-saturate-150 transition-opacity",
                  "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-white/35 dark:bg-white/10 dark:text-white dark:shadow-[0_10px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)]",
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
                  "relative size-3 rounded-full border transition-[box-shadow,background-color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-white/70 dark:focus-visible:ring-offset-zinc-950",
                  isActive
                    ? "border-zinc-900 bg-zinc-900 shadow-[0_0_12px_rgb(39_39_42_/_0.35)] dark:border-white dark:bg-white dark:shadow-[0_0_14px_rgba(255,255,255,0.5)]"
                    : "border-zinc-400 bg-transparent hover:border-zinc-600 hover:bg-zinc-200 dark:border-white/45 dark:hover:border-white/70 dark:hover:bg-white/15",
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
