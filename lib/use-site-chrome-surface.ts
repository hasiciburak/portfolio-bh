"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import {
  surfaceFromResolvedTheme,
  type SiteChromeSurface,
} from "@/lib/site-chrome-variant";

const SSR_CHROME_SURFACE: SiteChromeSurface = "darkSurface";

/**
 * Mirrors next-themes `resolvedTheme` after mount. Until then, returns a fixed
 * dark-first surface so SSR HTML matches the first client render (no hydration mismatch).
 */
export const useSiteChromeSurface = (): SiteChromeSurface => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return SSR_CHROME_SURFACE;
  }

  return surfaceFromResolvedTheme(resolvedTheme);
}
