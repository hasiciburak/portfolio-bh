"use client";

import { Glass, type GlassOptics } from "@samasante/liquid-glass";
import gsap from "gsap";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface ServicesCursorProps {
  /** The deck the cursor watches. Cards are found underneath it by class. */
  deckRef: RefObject<HTMLElement | null>;
  label: string;
}

/*
 * A lens that follows the pointer is the showcase use of this material, and the
 * optics are set accordingly — strong, domed, no frost — because it moves over
 * card copy and a 64px index numeral, which is exactly the kind of thing a bend
 * is visible on. `frost` is a light blur only: with none at all the disc read
 * as a clear window rather than glass, and the card copy under it competed with
 * the label — a few px softens what is behind without hiding that it bends.
 *
 * Material mode, so the lens is the element's own `backdrop-filter` and simply
 * rides along with the transform GSAP applies — nothing is re-rasterized per
 * frame. In Chromium that bends the live cards under the pointer; Safari and
 * Firefox get the tint and the rim without the bend.
 */
const CURSOR_OPTICS: Partial<GlassOptics> = {
  strength: 0.3,
  depth: 0.9,
  curvature: 0.5,
  bend: 0.75,
  bendWidth: 0.2,
  dispersion: 0.4,
  frost: 6,
  saturate: 1.3,
  brightness: 0,
  specular: 1,
  sheen: 0.8,
  glow: 0.5,
};

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
    // The element <Glass> renders — the one carrying the backdrop filter. It does
    // not forward a ref, so it is found by the attribute it stamps on itself.
    const lens = cursor?.querySelector<HTMLElement>("[data-liquid-glass]");
    if (!deck || !cursor || !lens) return undefined;

    // The native arrow goes only once we know we can replace it — if this effect
    // never runs, the cards keep the pointer the browser gives a link.
    deck.dataset.cursor = "custom";

    /*
     * The resting scale is 1, not the 0.3 the badge grows from. <Glass> sizes its
     * lens from `getBoundingClientRect()`, which reads the *transformed* box, and
     * it re-measures on window resize — most of which happen while the badge is
     * hidden. Parked at 0.3, a resize would size the lens for a 26px disc and it
     * would show up broken at 86px. Invisible is invisible at any scale, so the
     * badge rests at 1 and `show()` supplies the 0.3 start itself.
     *
     * Two targets, split by property. `cursor` (the outer box) takes every
     * transform: x, y, scale. `lens` (the element with the backdrop filter) takes
     * opacity — and only it may. An ancestor at `opacity < 1` is a *backdrop
     * root*: its descendants' backdrop filters can then only see what that
     * ancestor itself painted, which behind the lens is nothing. Fading the outer
     * box therefore switched the bend off for the whole fade and on only at the
     * exact frame opacity reached 1 — the badge appeared, the glass caught up a
     * beat later. An element's own opacity does not do this to its own filter,
     * so the fade lives on the lens. (`autoAlpha`'s `visibility: hidden` is also
     * out: it drops the compositing layer, and the lens is rebuilt on each show.)
     */
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(lens, { opacity: 0 });

    /*
     * quickTo rather than a tween per event: it reuses one tween and overwrites its
     * end value, so a pointermove costs no allocation. The easing is what makes the
     * badge trail the pointer slightly instead of being welded to it.
     */
    const moveX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    let visible = false;
    // True once a hide has fully completed (scale parked back at 1) — the next
    // show must then start from 0.3. A show that interrupts a hide continues
    // from wherever the scale is, which is what keeps the reversal smooth.
    let resting = true;
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
      if (resting) gsap.set(cursor, { scale: 0.3 });
      resting = false;
      gsap.to(lens, { opacity: 1, duration: 0.28, ease: "power2.out", overwrite: "auto" });
      gsap.to(cursor, {
        scale: 1,
        duration: 0.28,
        ease: "back.out(1.7)",
        /*
         * "auto", never `true`: a blanket overwrite kills every tween on the target,
         * and two of them are the quickTo instances that carry x and y. Killed, the
         * badge stopped following the pointer entirely and only ever moved in the
         * jump `show()` gives it. "auto" kills conflicting properties only, and
         * scaling has none in common with moving.
         */
        overwrite: "auto",
      });
    };

    const hide = () => {
      visible = false;
      gsap.ticker.remove(watch);
      gsap.to(lens, { opacity: 0, duration: 0.18, ease: "power2.in", overwrite: "auto" });
      gsap.to(cursor, {
        scale: 0.3,
        duration: 0.18,
        ease: "power2.in",
        /*
         * "auto", never `true`: a blanket overwrite kills every tween on the target,
         * and two of them are the quickTo instances that carry x and y. Killed, the
         * badge stopped following the pointer entirely and only ever moved in the
         * jump `show()` gives it. "auto" kills conflicting properties only, and
         * scaling has none in common with moving.
         */
        overwrite: "auto",
        onComplete: () => {
          gsap.set(cursor, { scale: 1 });
          resting = true;
        },
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
      gsap.killTweensOf(lens);
    };
  }, [deckRef, enabled, mounted]);

  if (!mounted || !enabled) return null;

  /*
   * Two elements, one job each. The outer div is what GSAP moves and scales;
   * <Glass> fills it, carries the lens, and is what fades — see the note on the
   * backdrop root in the effect above for why the fade cannot live out here.
   *
   * The tint keeps the badge's teal identity, at an alpha the lens can see
   * through. The label is dark on light teal and white on dark teal — the solid
   * disc could use one text colour, a translucent one takes the theme behind it.
   */
  return createPortal(
    <div
      ref={cursorRef}
      aria-hidden
      className="services-cursor pointer-events-none fixed left-0 top-0 z-[70] h-[86px] w-[86px]"
    >
      <Glass
        optics={CURSOR_OPTICS}
        // <Glass> writes `display: inline-block` to the inline style; the flex
        // column for the glyph and label has to be written there too to win.
        style={{ display: "flex" }}
        className="h-full w-full flex-col items-center justify-center gap-1 rounded-full opacity-0 border border-white/45 bg-teal-500/45 text-zinc-950 shadow-[0_12px_32px_rgb(15_23_42_/_0.18)] dark:border-white/25 dark:bg-teal-400/30 dark:text-white dark:shadow-[0_12px_32px_rgb(0_0_0_/_0.35)]"
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
      </Glass>
    </div>,
    document.body,
  );
};

export default ServicesCursor;
