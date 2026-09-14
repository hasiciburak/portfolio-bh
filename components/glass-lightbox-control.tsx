"use client";

import { useEffect, useRef, useState } from "react";
import { Glass, type GlassOptics } from "@samasante/liquid-glass";

/**
 * A lightbox control as a glass lens over the photo behind it.
 *
 * This is the one place on the site where the bend works in every browser. The
 * header capsules are a glass *material*: they filter the live page through
 * `backdrop-filter: url()`, which only Chromium ships, so Safari and Firefox get
 * frost and tint but no refraction. Here the lens instead refracts a *copy* of
 * the photo — an ordinary `<img>` inside the lens, displaced by an SVG filter —
 * and that path has no browser caveat.
 *
 * The price of a copy is that nothing aligns it for us: the copy has to be laid
 * out at the photo's real on-screen position, expressed relative to this
 * control's own box. Hence `photo` (measured by the gallery, in viewport
 * coordinates) and the offset measured here — the two rects subtract to give the
 * copy's position inside the lens.
 */

/**
 * The bleed ring the lens samples just past the copy, i.e. what the controls sit
 * on when they are not over the photo: `black/85` over a blurred page. Near-black
 * is right for both themes, and it doubles as the resting fill before the photo
 * has been measured, so the lens never flashes an empty frame.
 */
const BACKDROP_FILL = "rgb(20 20 23)";

/*
 * Far stronger than the header's optics, because nothing here has to stay
 * readable through the glass: the glyph renders crisp on top, and everything the
 * lens distorts is photography. `frost` is near zero for the same reason — a
 * blur would undo the point, which is that you can see the picture bend.
 */
const LIGHTBOX_OPTICS: Partial<GlassOptics> = {
  strength: 0.26,
  depth: 0.85,
  curvature: 0.4,
  bend: 0.8,
  bendWidth: 0.2,
  dispersion: 0.35,
  frost: 1.5,
  brightness: 0,
  specular: 1,
  sheen: 0.7,
  glow: 0.4,
};

export interface LensPhoto {
  /** The rendered source — `currentSrc`, so the copy reuses the cached file. */
  src: string;
  /** The photo's box in viewport coordinates. */
  rect: { left: number; top: number; width: number; height: number };
}

interface GlassLightboxControlProps {
  photo: LensPhoto | null;
  /** Position and size of the control — this lands on the fixed outer box. */
  className: string;
  /** Type adjustments for the glyph (size, optical centring). */
  buttonClassName?: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const GlassLightboxControl = ({
  photo,
  className,
  buttonClassName = "",
  label,
  disabled = false,
  onClick,
  children,
}: GlassLightboxControlProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !photo) {
      setOffset(null);
      return undefined;
    }

    // Both rects are viewport-relative — this control is `fixed` and the gallery
    // measures the photo the same way — so the difference is the copy's position
    // inside the lens, with no scroll or ancestor offset to account for.
    const measure = () => {
      const rect = box.getBoundingClientRect();
      setOffset({ x: photo.rect.left - rect.left, y: photo.rect.top - rect.top });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [photo]);

  const copy =
    photo && offset ? (
      /*
       * Deliberately a bare <img>, not next/image. `photo.src` is already the
       * optimiser's output (the gallery reads `currentSrc` off the rendered
       * photo), so this hits the browser cache with no second request; handing
       * that URL back to next/image would ask the optimiser to optimise its own
       * output. It also needs an exact px box to align with the real photo,
       * which is the opposite of what next/image's sizing is for.
       */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: "absolute",
          left: offset.x,
          top: offset.y,
          width: photo.rect.width,
          height: photo.rect.height,
          // The gallery's `max-w-[92vw]` would otherwise shrink the copy too.
          maxWidth: "none",
        }}
      />
    ) : null;

  return (
    <div
      ref={boxRef}
      className={`${className} ${disabled ? "pointer-events-none opacity-30" : ""}`}
    >
      {/*
        The lens is a sibling *under* the button, not its parent. In refract mode
        <Glass> paints the refracted copy above its own children, so a glyph
        passed as `children` would end up behind the photo it is supposed to
        label. A fragment keeps `refract` non-null before the copy is measured,
        which keeps the component in refract mode rather than flipping it to the
        material path for a frame.
      */}
      <Glass
        aria-hidden
        refract={<>{copy}</>}
        behind={BACKDROP_FILL}
        optics={LIGHTBOX_OPTICS}
        className="pointer-events-none absolute inset-0 rounded-full"
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`absolute inset-0 flex items-center justify-center rounded-full border border-white/20 text-white outline-none transition hover:border-white/35 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 ${buttonClassName}`}
      >
        {children}
      </button>
    </div>
  );
}
