"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { GlassLightboxControl, type LensPhoto } from "@/components/glass-lightbox-control";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface LightboxCopy {
  prev: string;
  next: string;
  close: string;
}

/**
 * Shared box for every control floating over the lightbox backdrop. `fixed`
 * anchors to the viewport rather than the dialog's content box, so the controls
 * stay put whatever the aspect ratio of the current image.
 *
 * This is now only position and size: the surface is a glass lens refracting the
 * photo behind it, and the border and hover state ride on the button inside it.
 * See `glass-lightbox-control.tsx`.
 */
const lightboxControl = "fixed rounded-full transition-opacity";

/**
 * Below `sm` the arrows pair up in the bottom-right corner, clear of the image and
 * within thumb reach; from `sm` they split to the left and right edges at the
 * vertical centre. Both layouts come from one element, so there is no duplicated
 * markup and no breakpoint at which a control is missing.
 */
const lightboxArrow = `${lightboxControl} bottom-[max(1rem,env(safe-area-inset-bottom))] h-11 w-11 sm:bottom-auto sm:top-1/2 sm:h-12 sm:w-12 sm:-translate-y-1/2`;

/** Horizontal travel, in px, before a touch counts as a page rather than a tap. */
const SWIPE_THRESHOLD = 48;

/** State a trigger needs to open the lightbox; pass the whole object to `ProjectLightbox`. */
export const useProjectLightbox = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((index: number) => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
    // ScrollSmoother hijacks wheel events globally; pausing it stops the page
    // drifting behind the modal. It is absent when the visitor prefers reduced motion.
    ScrollSmoother.get()?.paused(true);
  }, []);

  return { dialogRef, activeIndex, setActiveIndex, open };
};

export type ProjectLightboxState = ReturnType<typeof useProjectLightbox>;

/**
 * Full-size image viewer in a native `<dialog>`, which renders in the browser's
 * top layer and therefore escapes the transformed `#smooth-content` ancestor that
 * would otherwise trap a `position: fixed` overlay. Used by the case-study gallery
 * and by the image rows inside a case study's MDX body.
 */
export const ProjectLightbox = ({
  images,
  state,
  copy,
}: {
  images: LightboxImage[];
  state: ProjectLightboxState;
  copy: LightboxCopy;
}) => {
  const { dialogRef, activeIndex, setActiveIndex } = state;

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
    [images.length, setActiveIndex],
  );

  const isLightboxOpen = activeIndex !== null;

  /*
   * The photo's on-screen box, so the controls floating over it can refract a
   * copy of it. Measured here rather than in each control: there is one photo and
   * three controls, and `currentSrc` is only knowable from the rendered element —
   * using it (instead of the raw `src`) means the copies reuse the file the
   * browser has already downloaded and optimised, at no extra network cost.
   */
  const photoRef = useRef<HTMLImageElement>(null);
  const [lensPhoto, setLensPhoto] = useState<LensPhoto | null>(null);

  useEffect(() => {
    const photo = photoRef.current;
    if (!isLightboxOpen || !photo) {
      setLensPhoto(null);
      return undefined;
    }

    const measure = () => {
      const { left, top, width, height } = photo.getBoundingClientRect();
      if (!width || !height) return;
      setLensPhoto({ src: photo.currentSrc || photo.src, rect: { left, top, width, height } });
    };

    // `observe()` fires once immediately, which seeds the first measurement, and
    // again when the image lands or the viewport reflows it — a lightbox photo is
    // sized by `max-h-[82vh]`/`max-w-[92vw]`, so both axes move with the window.
    const observer = new ResizeObserver(measure);
    observer.observe(photo);
    window.addEventListener("resize", measure);
    // Paging swaps the `src` on the same element. The observer only fires if the
    // box changes, so two images of identical dimensions would leave `currentSrc`
    // — and therefore the refracted copy — showing the previous photo.
    photo.addEventListener("load", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      photo.removeEventListener("load", measure);
    };
  }, [isLightboxOpen, activeIndex]);

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

  const isPageable = images.length > 1;
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const canStepBack = activeIndex !== null && activeIndex > 0;
  const canStepForward = activeIndex !== null && activeIndex < images.length - 1;

  return (
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
            ref={photoRef}
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
          <GlassLightboxControl
            photo={lensPhoto}
            onClick={() => stepLightbox(-1)}
            disabled={!canStepBack}
            label={copy.prev}
            /* 4.25rem clears the next button (1rem edge + 2.75rem button + 0.5rem gap). */
            className={`${lightboxArrow} right-[4.25rem] sm:left-4 sm:right-auto lg:left-6`}
            buttonClassName="pb-0.5 text-2xl leading-none"
          >
            <span aria-hidden>&#8249;</span>
          </GlassLightboxControl>
          <GlassLightboxControl
            photo={lensPhoto}
            onClick={() => stepLightbox(1)}
            disabled={!canStepForward}
            label={copy.next}
            className={`${lightboxArrow} right-4 lg:right-6`}
            buttonClassName="pb-0.5 text-2xl leading-none"
          >
            <span aria-hidden>&#8250;</span>
          </GlassLightboxControl>
        </>
      ) : null}

      <GlassLightboxControl
        photo={lensPhoto}
        onClick={() => dialogRef.current?.close()}
        label={copy.close}
        className={`${lightboxControl} right-2 top-2 h-10 w-10 sm:right-4 sm:top-4`}
        buttonClassName="text-lg"
      >
        <span aria-hidden>&#10005;</span>
      </GlassLightboxControl>
    </dialog>
  );
};
