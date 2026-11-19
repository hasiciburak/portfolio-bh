"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ProjectLightbox, useProjectLightbox } from "@/components/project-lightbox";
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
 * Screenshot carousel. Paging is native CSS scroll-snap, so drag, trackpad, touch
 * and keyboard all work with no JS; the arrows and progress bar are progressive
 * enhancement on top. Clicking a slide opens it in `ProjectLightbox`.
 */
export const ProjectGallery = ({
  images,
  copy,
}: {
  images: ProjectGalleryImage[];
  copy: GalleryCopy;
}) => {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const lightbox = useProjectLightbox();
  const [progress, setProgress] = useState({ thumb: 100, offset: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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

  if (!images.length) {
    return null;
  }

  const isPageable = images.length > 1;

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
              onClick={() => lightbox.open(index)}
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
                /* transform-gpu promotes the slide to its own compositor layer, so the
                   zoom is a GPU texture scale rather than a per-frame repaint of a
                   full-bleed bitmap. ease-out front-loads the travel: the default
                   ease-in-out spends both ends of a 2% scale moving sub-pixel amounts,
                   which is what reads as sticky. */
                className="h-full w-full transform-gpu object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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

      <ProjectLightbox images={images} state={lightbox} copy={copy} />
    </section>
  );
};
