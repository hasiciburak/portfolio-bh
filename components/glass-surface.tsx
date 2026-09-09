"use client";

import { Glass, type GlassOptics, type GlassProps } from "@samasante/liquid-glass";

import styles from "./glass-surface.module.css";

/*
 * The header's floating capsules — the nav pill and the two switches — as a real
 * liquid-glass material rather than a flat frosted fill.
 *
 * <Glass> rasterizes a rounded-rect signed-distance field into a displacement map
 * and feeds it to an SVG `feDisplacementMap` in the element's `backdrop-filter`,
 * so the page genuinely bends through the capsule as it scrolls underneath. That
 * last step needs `backdrop-filter: url()`, which is Chromium-only; in Safari and
 * Firefox the same component still frosts, tints and edge-lights, so the capsule
 * reads as glass everywhere and only the bend is progressive enhancement.
 *
 * Everything theme-dependent lives in the CSS module — see the note there.
 */

/*
 * Tuned for a ~44px-tall pill, not for a demo lens. `strength` and `curvature`
 * are deliberately low: at the showcase values a 44px capsule magnifies whatever
 * passes behind it into a smear directly under the labels, and this pill is fixed
 * over a page that scrolls 40–64px headlines through it. The look comes from the
 * rim instead — `bend` in a thin `bendWidth` band, so the background compresses
 * at the contour and the middle stays quiet enough to read type against.
 */
const HEADER_OPTICS: Partial<GlassOptics> = {
  strength: 0.09,
  // Keeps the refraction to a band around the edge, which also gates `curvature`
  // — the centre stays flat however domed the rest is.
  depth: 0.3,
  curvature: 0.18,
  bend: 0.7,
  bendWidth: 0.22,
  dispersion: 0.22,
  frost: 7,
  saturate: 1.7,
  // The white veil and the dark rim are both theme-dependent, so they are the CSS
  // module's job; leaving them at 0 keeps one surface definition, not two.
  brightness: 0,
  specular: 0.9,
  sheen: 0.55,
  glow: 0.35,
};

type GlassSurfaceProps = GlassProps;

export const GlassSurface = ({ className, optics, style, ...rest }: GlassSurfaceProps) => {
  return (
    <Glass
      className={[styles.surface, className].filter(Boolean).join(" ")}
      optics={optics ? { ...HEADER_OPTICS, ...optics } : HEADER_OPTICS}
      /*
       * <Glass> shrink-wraps its content with `display: inline-block`, written to
       * the element's inline style — which beats any display a className sets, so
       * this is the only place it can be changed.
       *
       * It has to be changed, because an inline-block establishes an inline
       * formatting context for its children: an inline-level child (every capsule
       * here wraps an `inline-flex` row) then sits on the text baseline, and the
       * line box reserves room for descenders under it. That was ~6.5px of dead
       * space along the bottom of each capsule at this font size — the icons and
       * labels read as sitting high rather than centred.
       *
       * `inline-flex` keeps the shrink-to-fit sizing, and blockifies the children
       * so there is no baseline to sit on. <Glass>'s own veil / rim / filter
       * layers are absolutely positioned, so they never become flex items.
       */
      style={{ display: "inline-flex", ...style }}
      {...rest}
    />
  );
}
