"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  INTRO_FAILSAFE_MS,
  INTRO_SESSION_KEY,
  INTRO_SPEED,
} from "@/lib/entrance-intro";

import styles from "./entrance-intro.module.css";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Full-bleed #HSC curtain that plays over the home page on first arrival.
 *
 * Must be mounted *outside* SmoothScrollProvider: ScrollSmoother transforms
 * #smooth-content, and a transformed ancestor makes `position: fixed` resolve
 * against that element instead of the viewport.
 *
 * Hero targets are addressed by data attribute rather than ref because they live
 * in a different subtree; their hidden start states are declared in globals.css
 * so they apply on first paint, not on hydration.
 */
export const EntranceIntro = () => {
  const curtainRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;

    // window first: React re-acquires <html> whenever it discards the server tree
    // and strips every attribute it did not render itself, so a missing
    // `data-intro` means "wiped" at least as often as it means "never armed".
    const mode = window.__bhIntroMode ?? root.dataset.intro;
    if (mode !== "play" && mode !== "reduced") return undefined;

    const curtain = curtainRef.current;
    if (!curtain) return undefined;

    // Put it back if it was stripped: the overlay's own visibility and every
    // hidden hero start state are CSS rules keyed off this attribute.
    root.dataset.intro = mode;

    // Written at the *start* of the sequence, so a refresh mid-intro skips it
    // rather than restarting it.
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // Safari private mode throws on write — the intro just replays next load.
    }

    const lines = gsap.utils.toArray<HTMLElement>("[data-intro-line]");
    const rises = gsap.utils.toArray<HTMLElement>("[data-intro-rise]");
    const portraits = gsap.utils.toArray<HTMLElement>("[data-intro-portrait]");
    const chrome = gsap.utils.toArray<HTMLElement>("[data-intro-chrome]");

    // ScrollSmoother is created by a sibling provider whose layout effect runs
    // after this one, so get() is null on the first pass — keep asking until the
    // instance exists, otherwise the page scrolls behind the curtain.
    let smootherFrame = 0;
    let released = false;

    const pauseSmoother = () => {
      const smoother = ScrollSmoother.get();
      if (!smoother) {
        smootherFrame = requestAnimationFrame(pauseSmoother);
        return;
      }
      if (!released) smoother.paused(true);
    };

    window.scrollTo(0, 0);
    pauseSmoother();

    let tl: gsap.core.Timeline | null = null;

    const release = () => {
      if (released) return;
      released = true;

      cancelAnimationFrame(smootherFrame);
      window.clearTimeout(failsafe);

      // Drops every hidden start state declared in globals.css. The window mirror
      // moves with it, so a re-run of this effect reads "done" and does not replay.
      root.dataset.intro = "done";
      window.__bhIntroMode = "done";

      // Kill before clearing: ScrollTrigger.refresh() below re-renders live
      // animations, and a surviving timeline puts every inline value it owns
      // straight back — which silently undid the clears here.
      tl?.kill();

      // On the failsafe path the timeline may be halfway through, which would
      // leave the hero stranded at an interpolated value. clip-path is set
      // rather than cleared so the element ends up with no clip region at all
      // instead of an inert `inset(-0.2em)` that still forces a paint layer.
      gsap.set([...lines, ...portraits], { clipPath: "none" });
      gsap.set([...rises, ...chrome], { clearProps: "opacity,transform" });

      ScrollSmoother.get()?.paused(false);
      ScrollTrigger.refresh();
    };

    const failsafe = window.setTimeout(release, INTRO_FAILSAFE_MS);

    tl = gsap.timeline({ onComplete: release });
    tl.timeScale(INTRO_SPEED);

    if (mode === "reduced") {
      tl.to(curtain, { opacity: 0, duration: 0.3, ease: "none" }).to(
        [...rises, ...chrome],
        { opacity: 1, duration: 0.25, ease: "none" },
        0,
      );
    } else {
      tl
        // Wordmark rises out of the mask, hairline draws under it.
        .fromTo(
          markRef.current,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.62, ease: "power3.out" },
          0,
        )
        .fromTo(
          ruleRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: "power2.out" },
          0.1,
        )
        // Both exit upward, hairline collapsing back toward its far end.
        .to(markRef.current, { yPercent: -115, duration: 0.4, ease: "power3.in" }, 0.7)
        .to(
          ruleRef.current,
          { scaleX: 0, transformOrigin: "100% 50%", duration: 0.28, ease: "power2.in" },
          0.7,
        )
        // Curtain lifts. power4 rather than expo: expo crawls at both ends, which
        // leaves the panel hanging just short of gone.
        .to(curtain, { yPercent: -100, duration: 0.62, ease: "power4.inOut" }, 0.86)

        // Everything below is fromTo, not to: the hidden start states come from
        // globals.css as *percentage* transforms, and re-declaring them here means
        // the tween never depends on how GSAP parses that computed style.
        //
        // Timing is set against the curtain edge, not against the clock. The edge
        // clears the headline (~35% down the viewport) around t≈1.2, so the lines
        // start their wipe at 1.06 and are only ~20% open when first visible —
        // otherwise the reveal finishes behind the panel and reads as a plain
        // fade-in. inOut rather than out: a wipe wants an even sweep, and the
        // front-loaded out-eases spend most of the tween imperceptibly creeping.
        .fromTo(
          lines,
          { clipPath: "inset(-0.2em 100% -0.2em -0.2em)" },
          {
            clipPath: "inset(-0.2em -0.2em -0.2em -0.2em)",
            duration: 0.78,
            ease: "power3.inOut",
            stagger: 0.13,
          },
          1.06,
        )
        .fromTo(
          portraits,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.95, ease: "power3.out" },
          0.94,
        )
        .fromTo(chrome, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 1.16)
        .fromTo(
          rises,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.07 },
          1.24,
        );
    }

    return release;
  }, []);

  return (
    <div className={styles.overlay} aria-hidden role="presentation">
      <div ref={curtainRef} className={styles.curtain}>
        <span className={styles.markClip}>
          <span ref={markRef} className={styles.mark}>
            #HSC
          </span>
        </span>
        <span ref={ruleRef} className={styles.rule} />
      </div>
    </div>
  );
};
