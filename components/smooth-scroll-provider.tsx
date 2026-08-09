"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const SmoothScrollReadyContext = createContext(false);

export const useSmoothScrollReady = (): boolean => {
  return useContext(SmoothScrollReadyContext);
}

/**
 * True on the touch-only devices where we hand scrolling back to the browser
 * (see `smoothTouch: 0` below), so #smooth-content carries no transform.
 *
 * Callers need this to pick a pin strategy: a transformed ancestor is what forces
 * `pinType: "transform"`, and without one `position: fixed` pinning is both correct
 * and free, because the compositor holds the pinned element in place instead of the
 * main thread rewriting a matrix on every scroll frame.
 *
 * `isTouch === 1` (touch-only, not the `2` of a hybrid laptop) is the exact test
 * ScrollSmoother itself uses to decide whether `smoothTouch` applies, so this stays
 * in lockstep with it rather than guessing from viewport width.
 */
export const isNativeTouchScroll = (): boolean => ScrollTrigger.isTouch === 1;

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      queueMicrotask(() => setReady(true));
      return undefined;
    }

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.25,
      // 0, not a small number: any non-zero smoothTouch makes ScrollSmoother pin
      // #smooth-wrapper to `position: fixed` and drive the full 12,000px of content
      // by a transform it rewrites every frame (ScrollSmoother.js:593). That takes
      // scrolling off the compositor and puts it on the main thread, where a phone
      // has to re-raster a viewport of content per frame — the page ran at ~20fps.
      // At 0 the wrapper stays `position: relative`, the transform is cleared, and
      // the browser scrolls natively. The instance still exists, so ScrollTrigger,
      // pinning, `ScrollSmoother.get()`, `scrollTo()` and `paused()` all keep working
      // on touch; only the easing (which native momentum already provides) is gone.
      smoothTouch: 0,
      effects: false,
    });

    // Pinned triggers register *after* smootherReady flips, so we cannot refresh synchronously here.
    // ScrollSmoother.refreshHeight() reads content.clientHeight; pin spacers must already exist.
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());

    // Nohemi loads async via @font-face — when it swaps, line heights shift and pin distances change.
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) ScrollTrigger.refresh();
        })
        .catch(() => undefined);
    }

    queueMicrotask(() => setReady(true));

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      smoother.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <SmoothScrollReadyContext.Provider value={ready}>
      {/*
        Do NOT use flex on #smooth-wrapper: it makes #smooth-content a flex item that shrinks to the
        wrapper's height. ScrollSmoother.refreshHeight() reads smooth-content.clientHeight, so a shrunk
        content yields ~0 scroll range and the footer becomes unreachable. Block layout lets content
        grow to the natural sum of its children's heights, which is what ScrollSmoother needs.
        Using flex *inside* #smooth-content (column + flex-1 main) is fine: the content box still
        sizes to its children for GSAP.
      */}
      <div id="smooth-wrapper" className="bg-background">
        <div
          id="smooth-content"
          className="relative flex min-h-[100svh] w-full flex-col bg-background"
        >
          {children}
        </div>
      </div>
    </SmoothScrollReadyContext.Provider>
  );
}
