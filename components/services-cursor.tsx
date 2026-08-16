"use client";

import gsap from "gsap";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface ServicesCursorProps {
  /** The deck the cursor watches. Cards are found underneath it by class. */
  deckRef: RefObject<HTMLElement | null>;
  label: string;
}

/**
 * A cursor that only exists over the services deck, where it names what a click
 * will do — the cards read as illustrations otherwise, and the ↗ in the corner is
 * a small thing to hang the whole affordance on.
 *
 * Mounted through a portal on `document.body` for the same reason the social dock
 * is: ScrollSmoother transforms #smooth-content, and `position: fixed` inside a
 * transformed ancestor is positioned against that ancestor instead of the
 * viewport, so a cursor rendered in place would drift away as the page scrolled.
 *
 * Mouse only, and only where a pointer is precise enough to have somewhere to be:
 * a touch has no hover state to decorate, and a coarse pointer would leave the
 * badge stranded wherever the last tap landed.
 */
export const ServicesCursor = ({ deckRef, label }: ServicesCursorProps) => {
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /*
     * `any-*`, not the primary-input `hover`/`pointer`: iPadOS Safari reports the
     * touchscreen for those two whether or not a trackpad is attached, so the badge
     * never appeared on an iPad driving a real cursor. A bare touchscreen answers
     * `none`/`coarse` here as well, which is the case this gate exists for.
     */
    const fine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(fine.matches && !still.matches);

    /*
     * Deferred a frame, like the social dock's own mount: the badge is a portal on
     * `document.body`, so it must not exist during hydration, and reading the media
     * queries straight into state in the effect body is a render cascade the lint
     * rule is right to object to.
     */
    const id = requestAnimationFrame(() => {
      setMounted(true);
      sync();
    });

    fine.addEventListener("change", sync);
    still.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(id);
      fine.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !enabled) return undefined;

    const deck = deckRef.current;
    const cursor = cursorRef.current;
    if (!deck || !cursor) return undefined;

    // The native arrow goes only once we know we can replace it — if this effect
    // never runs, the cards keep the pointer the browser gives a link.
    deck.dataset.cursor = "custom";

    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });

    /*
     * quickTo rather than a tween per event: it reuses one tween and overwrites its
     * end value, so a pointermove costs no allocation. The easing is what makes the
     * badge trail the pointer slightly instead of being welded to it.
     */
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    let visible = false;
    let lastX = 0;
    let lastY = 0;

    const overCard = (x: number, y: number) =>
      Boolean(document.elementFromPoint(x, y)?.closest(".services-card"));

    /*
     * GSAP's ticker, not a scroll listener. ScrollSmoother eases the page with a
     * transform for about a second after the native scroll event has already fired,
     * so a scroll-driven check runs while the card is still visually under the
     * pointer and then never runs again — the badge was left floating over the next
     * section. Running per frame catches the moment the card actually leaves, and
     * only while the badge is on screen, so it costs nothing the rest of the time.
     */
    const watch = () => {
      if (!overCard(lastX, lastY)) hide();
    };

    const show = () => {
      visible = true;
      gsap.ticker.add(watch);
      // Placed before it appears, so it grows where the pointer already is rather
      // than flying in from wherever it was last seen.
      gsap.set(cursor, { x: lastX, y: lastY });
      gsap.to(cursor, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.28,
        ease: "back.out(1.7)",
        /*
         * "auto", never `true`: a blanket overwrite kills every tween on the target,
         * and two of them are the quickTo instances that carry x and y. Killed, the
         * badge stopped following the pointer entirely and only ever moved in the
         * jump `show()` gives it. "auto" kills conflicting properties only, and
         * fading has none in common with moving.
         */
        overwrite: "auto",
      });
    };

    const hide = () => {
      visible = false;
      gsap.ticker.remove(watch);
      gsap.to(cursor, {
        autoAlpha: 0,
        scale: 0.3,
        duration: 0.18,
        ease: "power2.in",
        /*
         * "auto", never `true`: a blanket overwrite kills every tween on the target,
         * and two of them are the quickTo instances that carry x and y. Killed, the
         * badge stopped following the pointer entirely and only ever moved in the
         * jump `show()` gives it. "auto" kills conflicting properties only, and
         * fading has none in common with moving.
         */
        overwrite: "auto",
      });
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      lastX = event.clientX;
      lastY = event.clientY;

      const onCard = Boolean(
        (event.target as Element | null)?.closest?.(".services-card"),
      );

      if (onCard) {
        if (!visible) show();
        moveX(lastX);
        moveY(lastY);
      } else if (visible) {
        hide();
      }
    };

    const handleLeave = () => {
      if (visible) hide();
    };

    deck.addEventListener("pointermove", handleMove);
    deck.addEventListener("pointerleave", handleLeave);
    // A click that leaves the section — the cards all do — must not leave the badge
    // sitting over whatever the page scrolls to next.
    deck.addEventListener("click", handleLeave);

    return () => {
      delete deck.dataset.cursor;
      deck.removeEventListener("pointermove", handleMove);
      deck.removeEventListener("pointerleave", handleLeave);
      deck.removeEventListener("click", handleLeave);
      gsap.ticker.remove(watch);
      gsap.killTweensOf(cursor);
    };
  }, [deckRef, enabled, mounted]);

  if (!mounted || !enabled) return null;

  return createPortal(
    <div
      ref={cursorRef}
      aria-hidden
      className="services-cursor pointer-events-none fixed left-0 top-0 z-[70] flex h-[86px] w-[86px] flex-col items-center justify-center gap-1 rounded-full bg-teal-500 text-zinc-950 opacity-0 dark:bg-teal-400"
    >
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
        <path
          d="M7 17L17 7M17 7H9M17 7v8"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="px-2 text-center text-[11px] font-medium uppercase leading-tight tracking-[0.08em]">
        {label}
      </span>
    </div>,
    document.body,
  );
};

export default ServicesCursor;
