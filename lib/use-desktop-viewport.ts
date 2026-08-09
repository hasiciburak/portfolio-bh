"use client";

import { useLayoutEffect, useState } from "react";

/** Tailwind's `lg` breakpoint — the width at which the desktop-only chrome appears. */
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Whether the viewport is wide enough for the `lg:`-gated chrome (the section-index
 * rail, the fixed social dock) to actually be on screen.
 *
 * Those components read layout on GSAP's ticker — i.e. every frame, forever. Hiding
 * them with `hidden lg:flex` hides the pixels but not the work: on a phone the
 * callbacks still ran 60×/second, measuring elements nobody could see and holding
 * GSAP's rAF loop open so the main thread never went idle between scrolls. Gating on
 * the same breakpoint the CSS uses keeps the two in step.
 *
 * Starts `false` so the server and the first client render agree; a mismatch here
 * would restart React from the root (see `useAppPathname` for why that is costly).
 */
export const useDesktopViewport = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
};
