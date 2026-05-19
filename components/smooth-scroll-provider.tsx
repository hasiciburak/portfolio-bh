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
      smoothTouch: 0.1,
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
