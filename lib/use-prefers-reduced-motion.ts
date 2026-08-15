"use client";

import { useLayoutEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the visitor has asked the OS for less movement.
 *
 * Every animated section on the site gates its GSAP setup on this, and each one
 * used to carry its own copy of the hook — six identical definitions, which meant
 * six places to edit if the detection ever needed to change.
 *
 * `useLayoutEffect` rather than `useEffect` is the load-bearing detail: callers
 * decide whether to build a timeline at all from the returned value, and an effect
 * that resolves a frame late would let motion start before it could be cancelled —
 * exactly the flash a reduced-motion visitor asked not to see.
 *
 * Starts `false` so the server and the first client render agree, then corrects
 * itself before paint. Same reasoning as `useDesktopViewport`.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReduce(mq.matches);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
};
