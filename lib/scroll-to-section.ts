"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollSmoother);

/**
 * Scrolls a section into view the way the rest of the page scrolls.
 *
 * ScrollSmoother owns the scroll position on the home page, so a native anchor
 * jump fights it: the browser sets `scrollTop` while the smoother is still easing
 * its own transform toward the old value, and the two disagree for a moment.
 * Going through `smoother.scrollTo` hands it the target instead.
 *
 * Shared rather than local to one component because the section-index rail and
 * the hero's contact link both need it, and two implementations would drift into
 * two different scroll feels on the same page.
 */
export const scrollToSectionId = (
  id: string,
  prefersReducedMotion: boolean,
): void => {
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
};
