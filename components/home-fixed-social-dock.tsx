"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { SocialPill } from "@/components/social-pill";

/** Matches the `bottom-10` resting offset, in px. */
const REST_OFFSET = 40;

/** Space kept between the pill and the footer's top edge once it parks. */
const FOOTER_GAP = 20;

/**
 * ScrollSmoother transforms #smooth-content, which breaks descendant `position: fixed`.
 * Mounting here keeps the social dock viewport-fixed while smooth scrolling.
 *
 * The dock rides up to sit above the footer instead of covering its wordmark and
 * copyright. The lift is recomputed every frame from the footer's own position, so
 * it tracks the scroll continuously rather than snapping at a threshold.
 */
export const HomeFixedSocialDock = () => {
  const [mounted, setMounted] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;

    const dock = dockRef.current;
    const footer = document.querySelector<HTMLElement>("footer[aria-label='Site']");
    if (!dock || !footer) return undefined;

    let applied = -1;

    const follow = () => {
      // Where the pill's bottom edge would land if nothing pushed it: the resting
      // line, plus the gap we want to keep clear of the footer.
      const restLine = window.innerHeight - REST_OFFSET + FOOTER_GAP;
      const lift = Math.max(0, Math.round(restLine - footer.getBoundingClientRect().top));

      if (lift === applied) return;
      applied = lift;
      // `transform` rather than a Tailwind translate utility: the wrapper already
      // spends the `translate` property on its -50% horizontal centering, and the
      // two compose instead of overwriting each other.
      dock.style.transform = lift ? `translateY(${-lift}px)` : "";
    };

    // GSAP's ticker, not a scroll listener: ScrollSmoother animates the page with a
    // transform that keeps easing after native scroll events stop, so a scroll-driven
    // dock would freeze while the footer was still travelling toward it.
    gsap.ticker.add(follow);
    follow();

    return () => gsap.ticker.remove(follow);
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={dockRef}
      className="pointer-events-none fixed bottom-10 left-1/2 z-20 hidden -translate-x-1/2 justify-center px-2 lg:flex"
    >
      <div className="pointer-events-auto">
        <SocialPill />
      </div>
    </div>,
    document.body,
  );
}
