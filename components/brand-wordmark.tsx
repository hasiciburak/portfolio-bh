import Link from "next/link";

import type { SiteChromeSurface } from "@/lib/site-chrome-variant";

import styles from "./brand-wordmark.module.css";

export interface BrandWordmarkProps {
  surface: SiteChromeSurface;
}

export function BrandWordmark({ surface }: BrandWordmarkProps) {
  const isLightSurface = surface === "lightSurface";

  const focusClasses = isLightSurface
    ? "focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
    : "focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/70";

  return (
    <Link
      href="/"
      aria-label="Burak Haşıcı — home"
      className={`${styles.wordmarkLink} no-underline ${focusClasses}`}
    >
      <span
        className={[
          styles.wordmarkText,
          isLightSurface ? styles.onLightStroke : styles.onDarkStroke,
        ].join(" ")}
      >
        #HSC
      </span>
    </Link>
  );
}
