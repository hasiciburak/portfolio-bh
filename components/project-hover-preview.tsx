"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRef } from "react";

import type { ProjectGalleryImage } from "@/lib/project-content";
import { useDesktopViewport } from "@/lib/use-desktop-viewport";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

gsap.registerPlugin(useGSAP);

const WIDTH = 260;
const HEIGHT = 168;

/**
 * A screenshot that trails the pointer while a project row is hovered, scrubbing
 * through that project's gallery as the pointer crosses the row.
 *
 * Portalled to `document.body` rather than rendered in place: `#smooth-content`
 * carries a transform for ScrollSmoother, and a transformed ancestor makes
 * `position: fixed` resolve against that element instead of the viewport — the
 * preview would scroll away from the pointer. `HomeSectionIndex` portals for the
 * same reason.
 *
 * Desktop-only and off under reduced motion, so it never becomes the only way to
 * learn something: the row already carries the project's name, summary, stack and
 * year as text.
 */
export const ProjectHoverPreview = ({
  images,
  index,
  active,
}: {
  images?: ProjectGalleryImage[];
  index: number;
  active: boolean;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Latest pointer position, so an activation can start where the cursor already is. */
  const pointer = useRef({ x: 0, y: 0 });
  const isDesktop = useDesktopViewport();
  const reduceMotion = usePrefersReducedMotion();

  /*
   * No separate `mounted` flag: `useDesktopViewport` starts false and only flips
   * in a layout effect, so `enabled` is false on the server and through the first
   * client render — which is exactly the window in which `createPortal` must not
   * reach for `document.body`.
   */
  const enabled = isDesktop && !reduceMotion && Boolean(images?.length);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el || !enabled) return;

      /*
       * Jump to the pointer before fading in. Without this the preview animates
       * from wherever the last hover left it — across the page, if that is where
       * the previous row was — so it read as flying in rather than opening where
       * you are looking.
       */
      if (active) {
        gsap.set(el, {
          x: pointer.current.x - WIDTH / 2,
          y: pointer.current.y - HEIGHT / 2,
        });
      }

      /*
       * `quickTo` keeps one tween alive and retargets it per move, so the preview
       * eases toward the pointer instead of being snapped to it — that lag is what
       * makes it trail rather than sit glued to the cursor.
       */
      const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        pointer.current = { x: event.clientX, y: event.clientY };
        moveX(event.clientX - WIDTH / 2);
        moveY(event.clientY - HEIGHT / 2);
      };

      window.addEventListener("pointermove", onMove, { passive: true });

      gsap.to(el, {
        autoAlpha: active ? 1 : 0,
        scale: active ? 1 : 0.82,
        duration: 0.32,
        ease: "power3.out",
      });

      return () => window.removeEventListener("pointermove", onMove);
    },
    // No `revertOnUpdate`: this effect re-runs on every hover change, and
    // reverting would reset the position and opacity it is there to manage.
    { dependencies: [active, enabled] },
  );

  if (!enabled || !images?.length) return null;

  return createPortal(
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] overflow-hidden rounded-xl border border-zinc-950/10 opacity-0 shadow-[0_18px_50px_rgb(9_9_11_/_0.22)] dark:border-white/15"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      {/*
        Every slide is mounted and cross-faded by opacity rather than swapping one
        `src`. Scrubbing changes the image several times per sweep, and a single
        swapped element would re-request on each change and flash white while the
        next file arrived. Mounted together they are fetched once, on the first
        hover — this component renders nothing until then.
      */}
      {images.map((image, slide) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          sizes={`${WIDTH}px`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            slide === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>,
    document.body,
  );
};
