"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import type { ProjectGalleryImage } from "@/lib/project-content";

interface GalleryCopy {
  label: string;
  prev: string;
  next: string;
  expand: string;
  close: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shared chrome for every control floating over the lightbox backdrop. `fixed`
 * anchors to the viewport rather than the dialog's content box, so the controls
 * stay put whatever the aspect ratio of the current image.
 */
const lightboxControl =
  "fixed inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md outline-none transition hover:border-white/25 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-30";

/**
 * Below `sm` the arrows pair up in the bottom-right corner, clear of the image and
 * within thumb reach; from `sm` they split to the left and right edges at the
 * vertical centre. Both layouts come from one element, so there is no duplicated
 * markup and no breakpoint at which a control is missing.
 */
const lightboxArrow = `${lightboxControl} bottom-[max(1rem,env(safe-area-inset-bottom))] h-11 w-11 pb-0.5 text-2xl leading-none sm:bottom-auto sm:top-1/2 sm:h-12 sm:w-12 sm:-translate-y-1/2`;

/** Horizontal travel, in px, before a touch counts as a page rather than a tap. */
const SWIPE_THRESHOLD = 48;

/**
 * Screenshot carousel. Paging is native CSS scroll-snap, so drag, trackpad, touch
 * and keyboard all work with no JS; the arrows and progress bar are progressive
 * enhancement on top. Clicking a slide opens it in a native `<dialog>`, which
 * renders in the browser's top layer and therefore escapes the transformed
 * `#smooth-content` ancestor that would otherwise trap a `position: fixed` overlay.
 */
export const ProjectGallery = ({
  images,
  copy,
}: {
  images: ProjectGalleryImage[];
  copy: GalleryCopy;
}) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [progress, setProgress] = useState({ thumb: 100, offset: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const syncScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    const maxScroll = scrollWidth - clientWidth;

    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft >= maxScroll - 1);
    setProgress({
      thumb: Math.min(100, (clientWidth / scrollWidth) * 100),
      offset: (scrollLeft / scrollWidth) * 100,
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === "undefined") return undefined;

    // Slide widths are percentage-based, so a viewport change moves every boundary.
    // observe() also fires the callback once immediately, which seeds the initial
    // measurement without a synchronous setState in the effect body.
    const observer = new ResizeObserver(syncScrollState);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, [syncScrollState]);

  const page = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Measure a real slide instead of assuming a width, so the step always lands on a snap point.
    const slide = scroller.firstElementChild as HTMLElement | null;
    const step = slide ? slide.offsetWidth + 16 : scroller.clientWidth;

    scroller.scrollBy({
      left: step * direction,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
    // ScrollSmoother hijacks wheel events globally; pausing it stops the page
    // drifting behind the modal. It is absent when the visitor prefers reduced motion.
    ScrollSmoother.get()?.paused(true);
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    ScrollSmoother.get()?.paused(false);
  };

  const stepLightbox = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        return Math.min(images.length - 1, Math.max(0, current + direction));
      });
    },
    [images.length],
  );

  const isLightboxOpen = activeIndex !== null;

  // The slide itself is one element, so there is no scroll container to snap —
  // the swipe is measured by hand and only pages on a decisive horizontal drag.
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);

  const onSwipeStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    swipeOrigin.current = { x: touch.clientX, y: touch.clientY };
  };

  const onSwipeEnd = (event: React.TouchEvent) => {
    const origin = swipeOrigin.current;
    swipeOrigin.current = null;
    if (!origin) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - origin.x;
    const deltaY = touch.clientY - origin.y;

    // Ignore anything shorter than the threshold, or steeper than 45° — that is a
    // tap or a vertical drag, not a page.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    stepLightbox(deltaX < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    // Bound to the window rather than the dialog: reaching either end disables an
    // arrow, and a disabled button drops focus to <body>, which would stop a
    // dialog-scoped handler from ever seeing the key that steps back.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepLightbox(1);
      if (event.key === "ArrowLeft") stepLightbox(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, stepLightbox]);

  if (!images.length) {
    return null;
  }

  const isPageable = images.length > 1;
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const canStepBack = activeIndex !== null && activeIndex > 0;
  const canStepForward = activeIndex !== null && activeIndex < images.length - 1;

  return (
    <section aria-label={copy.label} className="mt-10 sm:mt-12">
      {isPageable ? (
        <div className="mb-3 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label={copy.prev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/95 bg-white text-zinc-700 shadow-sm outline-none transition hover:border-zinc-300 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 disabled:pointer-events-none disabled:opacity-35 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80 dark:shadow-none dark:hover:border-white/25 dark:hover:text-white dark:focus-visible:ring-white/35"
          >
            <span aria-hidden>&#8249;</span>
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label={copy.next}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/95 bg-white text-zinc-700 shadow-sm outline-none transition hover:border-zinc-300 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 disabled:pointer-events-none disabled:opacity-35 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80 dark:shadow-none dark:hover:border-white/25 dark:hover:text-white dark:focus-visible:ring-white/35"
          >
            <span aria-hidden>&#8250;</span>
          </button>
        </div>
      ) : null}

      <ul
        ref={scrollerRef}
        onScroll={syncScrollState}
        className={`no-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain pb-1 ${
          isPageable ? "snap-x snap-mandatory" : ""
        }`}
      >
        {images.map((image, index) => (
          <li
            key={image.src}
            className={`shrink-0 snap-start ${
              isPageable ? "basis-[85%] sm:basis-[70%] lg:basis-[62%]" : "basis-full"
            }`}
          >
            <button
              type="button"
              onClick={() => openLightbox(index)}
              aria-label={`${copy.expand} — ${image.alt}`}
              /* Fixed 16:10 box so every slide is the same height regardless of the
                 source image's shape — screenshots are already 16:10 and fill it
                 exactly; anything taller (a device mockup) crops its empty margins. */
              className="group block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-200/95 bg-white/80 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/[0.12] dark:bg-[rgb(22_22_26_/_0.45)] dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.25)] dark:focus-visible:ring-white/35"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 62vw, (min-width: 640px) 70vw, 85vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </button>
            {image.caption ? (
              <p className="mt-2.5 text-[13px] leading-snug text-zinc-500 dark:text-white/45">
                {image.caption}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {isPageable ? (
        <div
          aria-hidden
          className="mt-4 h-px w-full overflow-hidden bg-zinc-200 dark:bg-white/12"
        >
          <div
            className="h-full bg-zinc-900 transition-[margin,width] duration-150 dark:bg-white/70"
            style={{
              width: `${progress.thumb}%`,
              marginInlineStart: `${progress.offset}%`,
            }}
          />
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={closeLightbox}
        onClick={(event) => {
          // The dialog element fills the viewport, so a click that lands on it
          // rather than on the figure inside is a backdrop click.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-none max-w-none border-none bg-transparent p-4 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        {activeImage ? (
          <figure
            onTouchStart={onSwipeStart}
            onTouchEnd={onSwipeEnd}
            className="flex touch-pan-y flex-col items-center gap-3"
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              width={activeImage.width}
              height={activeImage.height}
              sizes="92vw"
              className="max-h-[82vh] w-auto max-w-[92vw] rounded-xl object-contain"
            />
            <figcaption className="flex items-center gap-3 text-[13px] text-white/70">
              {images.length > 1 ? (
                <span className="tabular-nums text-white/45">
                  {(activeIndex ?? 0) + 1} / {images.length}
                </span>
              ) : null}
              {activeImage.caption}
            </figcaption>
          </figure>
        ) : null}

        {isPageable ? (
          <>
            <button
              type="button"
              onClick={() => stepLightbox(-1)}
              disabled={!canStepBack}
              aria-label={copy.prev}
              /* 4.25rem clears the next button (1rem edge + 2.75rem button + 0.5rem gap). */
              className={`${lightboxArrow} right-[4.25rem] sm:left-4 sm:right-auto lg:left-6`}
            >
              <span aria-hidden>&#8249;</span>
            </button>
            <button
              type="button"
              onClick={() => stepLightbox(1)}
              disabled={!canStepForward}
              aria-label={copy.next}
              className={`${lightboxArrow} right-4 lg:right-6`}
            >
              <span aria-hidden>&#8250;</span>
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={copy.close}
          className={`${lightboxControl} right-2 top-2 h-10 w-10 text-lg sm:right-4 sm:top-4`}
        >
          <span aria-hidden>&#10005;</span>
        </button>
      </dialog>
    </section>
  );
};
